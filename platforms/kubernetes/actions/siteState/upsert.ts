import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { SiteState, State } from "../../loaders/siteState/get.ts";
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
  const releaseName = State.secretName;
  const siteSecret = State.toSecret(site, state);
  const secret = await (create
    ? k8sApi.createNamespacedSecret(
      site,
      siteSecret,
    )
    : k8sApi.replaceNamespacedSecret(
      releaseName,
      site,
      siteSecret,
    ));
  if (
    secret.response.statusCode &&
    secret.response.statusCode >= 400
  ) {
    badRequest({ message: "could not set site state" });
  }
}
