import { ignoreIfExists } from "../../common/objects.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { DECO_SITES_PVC } from "../build.ts";

export interface Props {
  site: string;
}

const wildcardCertFor = (namespace: string) => ({
  apiVersion: "cert-manager.io/v1",
  kind: "Certificate",
  metadata: {
    name: "domain-wildcard-cert",
    namespace,
  },
  spec: {
    secretName: "domain-wildcard-cert",
    duration: "2160h0m0s", // 90d
    renewBefore: "360h0m0s", // 15d
    privateKey: {
      algorithm: "RSA",
      encoding: "PKCS1",
      size: 2048,
    },
    usages: ["server auth", "client auth"],
    dnsNames: ["*.decocdn.com"],
    issuerRef: {
      name: "letsencrypt-prod-cluster",
      kind: "ClusterIssuer",
      group: "cert-manager.io",
    },
  },
});

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
  const customObjectApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);

  await corev1Api.createNamespace({
    metadata: { name: site },
  }).catch(ignoreIfExists);
  await Promise.all([
    customObjectApi.createNamespacedCustomObject(
      "cert-manager.io",
      "v1",
      site,
      "certificates",
      wildcardCertFor(site),
    ).catch(ignoreIfExists),
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
