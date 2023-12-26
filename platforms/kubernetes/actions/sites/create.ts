import { ignoreIfExists } from "../../common/objects.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { DECO_SITES_PVC } from "../build.ts";

export interface Props {
  site: string;
}

const EFS_SC = "efs-sc";
/**
 * Provision namespace of the new site and required resources.
 * @title Create Site
 */
export default async function newSite(
  { site }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const corev1Api = ctx.kc.makeApiClient(k8s.CoreV1Api);

  await corev1Api.createNamespace({
    metadata: { name: site },
  }).catch(ignoreIfExists);
  await Promise.all([
    corev1Api.createNamespacedPersistentVolumeClaim(site, {
      metadata: { name: DECO_SITES_PVC, namespace: site },
      spec: {
        accessModes: ["ReadWriteMany"],
        storageClassName: EFS_SC,
        resources: { requests: { storage: "5Gi" } }, // since this should be EFS the size doesn't matter.
      },
    }).catch(ignoreIfExists),
    ctx.invoke.kubernetes.actions.siteState.upsert({
      site,
      state: ctx.defaultSiteState,
      create: true,
    }),
  ]);
}
