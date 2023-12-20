import { EnvVar } from "../../actions/k8s/newService.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
}

export const State = {
  forSite: (site: string) => `${site}-state`,
  fromSecret: (secret: k8s.V1Secret): SiteState | undefined => {
    const siteB64Str = secret.data?.["state"];
    return siteB64Str ? JSON.parse(atob(siteB64Str)) : undefined;
  },
  toSecret: (
    site: string,
    namespace: string,
    state: SiteState,
  ): k8s.V1Secret => {
    return {
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        name: State.forSite(site),
        namespace,
      },
      stringData: {
        state: JSON.stringify(state),
      },
    };
  },
};

export interface SiteState {
  release?: string;
  owner: string;
  repo: string;
  commitSha: string;
  envVars?: EnvVar[];
}

export default async function getSiteState(
  { site }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SiteState | undefined> {
  const k8sApi = ctx.kc.makeApiClient(k8s.CoreV1Api);
  const secret = await k8sApi.readNamespacedSecret(
    State.forSite(site),
    ctx.workloadNamespace,
  ).catch((err) => {
    if ((err as k8s.HttpError)?.statusCode === 404) {
      return undefined;
    }
    throw err;
  });
  return secret ? State.fromSecret(secret.body) : undefined;
}
