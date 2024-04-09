import { isDeploymentFromRepo, Platform } from "../../admin/platform.ts";
import { SOURCE_LOCAL_MOUNT_PATH } from "./actions/build.ts";
import { DeploymentId } from "./actions/deployments/create.ts";
import { Routes } from "./actions/deployments/rollout.ts";
import { defineNodeSelectorRules } from "./actions/sites/create.ts";
import { k8s } from "./deps.ts";
import {
  NODE_LABELS_KEY,
  NODE_LABELS_VALUES,
  SiteState,
} from "./loaders/siteState/get.ts";
import {
  AppContext,
  CONTROL_PLANE_DOMAIN,
  PREVIEW_SERVICE_RESOURCES,
  PREVIEW_SERVICE_SCALING,
} from "./mod.ts";

export interface Props {
  site: string;
  state: SiteState;
  deploymentId: string;
}

const DECO_RELEASE_ENV_VAR = "DECO_RELEASE";

export type Kubernetes = AppContext["invoke"]["kubernetes"];
export default function kubernetes(
  k8s: Kubernetes,
): Platform {
  const { loaders, actions } = k8s;
  return {
    supportsDynamicImport: true,
    name: "kubernetes",
    domain: CONTROL_PLANE_DOMAIN,
    cfZoneId: "eba5bf129d0b006fd616fd32f0c71492", // TODO (mcandeia) use deco.site c95fc4cec7fc52453228d9db170c372c
    sourceDirectory: SOURCE_LOCAL_MOUNT_PATH,
    sites: {
      create: async (props) => {
        await actions.sites.create(props);
      },
      delete: async (props) => await actions.sites.delete(props),
    },
    deployments: {
      promote: async (props) => {
        await actions.deployments.rollout(props);
      },
      create: async (
        props,
      ) => {
        const deploymentId = DeploymentId.new();
        const { site, production = false } = props;

        let desiredState = await loaders.siteState.get({ site });

        desiredState = applyAffinitiesAndNodeSelectors(desiredState, site);

        if (isDeploymentFromRepo(props)) {
          const { commitSha, owner, repo } = props;
          desiredState = {
            ...desiredState ?? {},
            source: {
              type: "github" as const,
              commitSha,
              owner,
              repo,
            },
          };
        } else {
          desiredState = {
            ...desiredState ?? {},
            envVars: [
              ...desiredState?.envVars ?? [],
              ...Object.entries(props.envVars ?? {}).map(([name, value]) => ({
                name,
                value,
              })),
            ],
            source: {
              type: "files",
              files: props.files,
            },
          };
        }

        let deploymentState = desiredState;
        if (!production) {
          deploymentState = {
            ...deploymentState ?? {},
            scaling: {
              ...deploymentState?.scaling ?? {},
              ...PREVIEW_SERVICE_SCALING,
            },
            resources: {
              requests: {
                ...deploymentState?.resources?.requests ?? {},
                ...PREVIEW_SERVICE_RESOURCES.requests,
              },
              limits: {
                ...deploymentState?.resources?.limits ?? {},
                ...PREVIEW_SERVICE_RESOURCES.limits,
              },
            },
          };
        }

        const deployment = await actions.deployments.create({
          site,
          siteState: deploymentState,
          deploymentId,
          labels: {
            deploymentId,
          },
        });
        if (production) {
          await actions.deployments.promote({
            site,
            state: desiredState,
            deploymentId,
          });
          return {
            ...deployment,
            domains: [...deployment.domains, {
              url: `https://${Routes.prod(site)}.${CONTROL_PLANE_DOMAIN}`,
              production: true,
            }],
          };
        }
        return deployment;
      },
      update: async ({ site, release }) => {
        const currentState = await loaders.siteState.get({ site });
        if (!currentState) {
          throw new Error(`site ${site} not found`);
        }
        const withoutRelease = (currentState?.envVars ?? []).filter((
          { name },
        ) => name !== DECO_RELEASE_ENV_VAR);
        let desiredState: SiteState = {
          ...currentState ?? {},
          envVars: [...withoutRelease, {
            name: DECO_RELEASE_ENV_VAR,
            value: release,
          }],
        };

        desiredState = applyAffinitiesAndNodeSelectors(desiredState, site);

        const deploymentId = DeploymentId.new();
        const deployment = await actions.deployments.create({
          site,
          siteState: desiredState,
          deploymentId,
          labels: {
            deploymentId,
          },
        });
        await actions.deployments.promote({
          site,
          state: desiredState,
          deploymentId,
        });
        return {
          ...deployment,
          domains: [...deployment.domains, {
            url: `https://${Routes.prod(site)}.${CONTROL_PLANE_DOMAIN}`,
            production: true,
          }],
        };
      },
    },
    domains: {
      create: async (props) => await actions.domains.create(props),
      delete: async (props) => await actions.domains.delete(props),
    },
  };
}

function applyAffinitiesAndNodeSelectors(
  desiredState: SiteState | undefined,
  site: string,
): SiteState {
  const sitesToApplyNodeSelector = ["admin", "play"]; //preciso adicionar os templates?

  if (desiredState === undefined) {
    desiredState = {};
  }

  if (sitesToApplyNodeSelector.includes(site)) {
    if (desiredState?.nodeSelector === undefined) {
      desiredState.nodeSelector = defineNodeSelectorRules(site);
    }
  } else {
    if (
      desiredState?.nodeAffinity === undefined &&
      desiredState?.nodeSelector === undefined
    ) {
      const affinitiesRules = [AntiAffinityPH];

      desiredState.nodeAffinity = affinitiesRules.reduce(
        (acc: k8s.V1NodeAffinity, rule) => {
          return {
            ...acc,
            requiredDuringSchedulingIgnoredDuringExecution: {
              nodeSelectorTerms: [
                ...acc.requiredDuringSchedulingIgnoredDuringExecution
                  ?.nodeSelectorTerms ?? [],
                rule(site),
              ],
            },
          };
        },
        {} as k8s.V1NodeAffinity,
      );
    }
  }

  return desiredState;
}

function AntiAffinityPH(_site: string): k8s.V1NodeSelectorTerm {
  const nodeLabelDecoEvent = NODE_LABELS_KEY.DECO_EVENT;
  const nodeValueProductHunt =
    NODE_LABELS_VALUES[nodeLabelDecoEvent].PRODUCT_HUNT;

  return {
    matchExpressions: [
      {
        key: nodeLabelDecoEvent,
        operator: "NotIn",
        values: [nodeValueProductHunt],
      },
    ],
  };
}
