import { isDeploymentFromRepo, Platform } from "../../admin/platform.ts";
import { SOURCE_LOCAL_MOUNT_PATH } from "./actions/build.ts";
import { DeploymentId } from "./actions/deployments/create.ts";
import { Routes } from "./actions/deployments/rollout.ts";
import { SiteState } from "./loaders/siteState/get.ts";
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
      delete: async (props) => {
        await actions.routes.delete(props);
      },
      create: async (
        props,
      ) => {
        const deploymentId = DeploymentId.new();
        const { site, production = false } = props;

        let desiredState = await loaders.siteState.get({ site });

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
          const scaling = {
            ...deploymentState?.scaling ?? {},
            ...PREVIEW_SERVICE_SCALING,
          };
          deploymentState = {
            ...deploymentState ?? {},
            scaling: {
              ...scaling,
              retentionPeriod: props.protected
                ? "30m"
                : scaling.retentionPeriod,
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
          hypervisor: !production,
          siteState: deploymentState,
          deploymentSlug: props.slug,
          deploymentId,
          labels: {
            ...props.protected ? { protected: "true" } : {},
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
        const desiredState: SiteState = {
          ...currentState ?? {},
          envVars: [...withoutRelease, {
            name: DECO_RELEASE_ENV_VAR,
            value: release,
          }],
        };

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
