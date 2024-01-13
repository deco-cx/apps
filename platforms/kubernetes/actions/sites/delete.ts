import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "./create.ts";

export interface Props {
  site: string;
}

/**
 * Provision namespace of the new site and required resources.
 * @title Delete Site
 */
export default async function deleteSite(
  { site }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const corev1Api = ctx.kc.makeApiClient(k8s.CoreV1Api);

  await corev1Api.deleteNamespace(Namespace.forSite(site));
}
