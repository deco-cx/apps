import { Platform } from "../../admin/platform.ts";
import { DeploymentId } from "./actions/deployments/create.ts";
import { SiteState } from "./loaders/siteState/get.ts";
import { AppContext, CONTROL_PLANE_DOMAIN } from "./mod.ts";

export interface Props {
  site: string;
  state: SiteState;
  deploymentId: string;
}

const DECO_RELEASE_ENV_VAR = "DECO_RELEASE";

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
        const deployment = await actions.deployments.create({
          site,
          siteState: desiredState,
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
              url: `https://sites-${site}.${CONTROL_PLANE_DOMAIN}`,
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
        const desiredState = {
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
            url: `https://sites-${site}.${CONTROL_PLANE_DOMAIN}`,
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
