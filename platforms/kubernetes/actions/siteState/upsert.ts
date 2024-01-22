import { ignoreIfExists } from "../../common/objects.ts";
import { k8s } from "../../deps.ts";
import { SiteState, State } from "../../loaders/siteState/get.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";

export interface Props {
  site: string;
  state: SiteState;
  create?: boolean;
}

/**
 * Set the site state saving the new state to the secret.
 * @title Set Site State
 */
export default async function setSiteState(
  { site, state, create }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const k8sApi = ctx.kc.makeApiClient(k8s.CoreV1Api);
  const releaseName = State.secretName;
  const siteNs = Namespace.forSite(site);
  const siteSecret = State.toSecret(siteNs, state);
  await (create
    ? k8sApi.createNamespacedSecret(
      siteNs,
      siteSecret,
    ).catch(ignoreIfExists)
    : k8sApi.replaceNamespacedSecret(
      releaseName,
      siteNs,
      siteSecret,
    ));
}
