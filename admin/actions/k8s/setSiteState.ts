import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { SiteState, State } from "../../loaders/k8s/siteState.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  state: SiteState;
}
export default async function setLatestRelease(
  { site, state }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const k8sApi = ctx.kc.makeApiClient(k8s.CoreV1Api);
  const releaseName = State.forSite(site);
  const secret = await k8sApi.replaceNamespacedSecret(
    releaseName,
    ctx.workloadNamespace,
    State.toSecret(site, ctx.workloadNamespace, state),
  );
  if (
    secret.response.statusCode &&
    secret.response.statusCode >= 400
  ) {
    badRequest({ message: "could not set latest release" });
  }
}
