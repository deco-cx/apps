import { badRequest } from "deco/mod.ts";
import { Deployment, Platform } from "../../admin/platform.ts";
import { DeploymentId } from "./actions/deployments/create.ts";
import { SiteState } from "./loaders/siteState/get.ts";
import { AppContext, CONTROL_PLANE_DOMAIN } from "./mod.ts";

export interface Props {
  site: string;
  state: SiteState;
  deploymentId: string;
}

const DECO_RELEASE_ENV_VAR = "DECO_RELEASE";

/**
 * Reconciles the site state based on the desired state.
 */
async function buildAndDeploy(
  { site, state: desiredState, deploymentId }: Props,
  { actions }: Kubernetes,
): Promise<Deployment> {
  const source = desiredState.source;
  if (!source) {
    badRequest({ message: "there's no source to deploy" });
  }
  // when code has changed so we need to build it.
  const buildResult = await actions.build({
    commitSha: source!.commitSha,
    repo: source!.repo,
    owner: source!.owner,
    builderImage: desiredState.builderImage,
    site,
  });
  await buildResult.waitUntil("succeed", 300_000);

  // a new service should be created regardless
  await actions.deployments.create({
    scaling: desiredState.scaling,
    labels: {
      deploymentId,
    },
    site,
    deploymentId,
    siteState: desiredState,
  });

  const domains = [{
    url: `https://site-${site}-${deploymentId}.${CONTROL_PLANE_DOMAIN}`,
    production: false,
  }];
  return { id: deploymentId, domains };
}

type Kubernetes = AppContext["invoke"]["kubernetes"];
export default function kubernetes(
  k8s: Kubernetes,
): Platform {
  const { loaders, actions } = k8s;
  return {
    name: "kubernetes",
    domain: CONTROL_PLANE_DOMAIN,
    cfZoneId: "eba5bf129d0b006fd616fd32f0c71492",
    sites: {
      create: async (props) => await actions.sites.create(props),
      delete: async (props) => await actions.sites.delete(props),
    },
    deployments: {
      promote: async (props) => {
        await actions.deployments.rollout(props);
      },
      create: async (
        { site, commitSha, owner, repo, production = false },
      ) => {
        const deploymentId = DeploymentId.new();
        const currentState = await loaders.siteState.get({ site });
        const desiredState = {
          ...currentState ?? {},
          source: {
            type: "github" as const,
            commitSha,
            owner,
            repo,
          },
        };
        const deployment = await buildAndDeploy({
          site,
          state: desiredState,
          deploymentId,
        }, k8s);
        if (production) {
          await actions.deployments.promote({
            site,
            state: desiredState,
          });
          return {
            ...deployment,
            domains: [...deployment.domains, {
              url: `https://site-${site}.${CONTROL_PLANE_DOMAIN}`,
              production: true,
            }],
          };
        }
        return deployment;
      },
      withRelease: async ({ site, release }) => {
        const currentState = await loaders.siteState.get({ site });
        if (!currentState) {
          throw new Error(`site ${site} not found`);
        }
        const withoutRelease = (currentState?.envVars ?? []).filter((
          { name },
        ) => name !== DECO_RELEASE_ENV_VAR);
        const desiredState = {
          ...currentState ?? {},
          envVars: [...withoutRelease, {
            name: DECO_RELEASE_ENV_VAR,
            value: release,
          }],
        };
        const deployment = await buildAndDeploy({
          site,
          state: desiredState,
          deploymentId: DeploymentId.new(),
        }, k8s);
        await actions.deployments.promote({
          site,
          state: desiredState,
        });
        return {
          ...deployment,
          domains: [...deployment.domains, {
            url: `https://site-${site}.${CONTROL_PLANE_DOMAIN}`,
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
