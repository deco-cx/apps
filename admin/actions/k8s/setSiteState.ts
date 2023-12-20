import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { SiteState, State } from "../../loaders/k8s/siteState.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  state: SiteState;
  create?: boolean;
}

/**
 * Set the site state saving the new state to the secret.
 */
export default async function setSiteState(
  { site, state, create }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const k8sApi = ctx.kc.makeApiClient(k8s.CoreV1Api);
  const releaseName = State.forSite(site);
  const siteSecret = State.toSecret(site, ctx.workloadNamespace, state);
  const secret = await (create
    ? k8sApi.createNamespacedSecret(
      ctx.workloadNamespace,
      siteSecret,
    )
    : k8sApi.replaceNamespacedSecret(
      releaseName,
      ctx.workloadNamespace,
      siteSecret,
    ));
  if (
    secret.response.statusCode &&
    secret.response.statusCode >= 400
  ) {
    badRequest({ message: "could not set site state" });
  }
}
