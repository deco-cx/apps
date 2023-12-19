import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
export interface Props {
  site: string;
  domain: string;
}

export default async function newDomain(
  { site, domain }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const certificateManifest = {
    apiVersion: "cert-manager.io/v1",
    kind: "Certificate",
    metadata: {
      name: domain,
      namespace: ctx.workloadNamespace,
    },
    spec: {
      commonName: "selfsigned-ca",
      dnsNames: [domain],
      isCA: true,
      issuerRef: {
        group: "cert-manager.io",
        kind: "ClusterIssuer",
        name: "selfsigned-issuer",
      },
      privateKey: {
        algorithm: "ECDSA",
        size: 256,
      },
      secretName: domain,
    },
  };

  // Define your DomainMapping manifest
  const domainMappingManifest = {
    apiVersion: "serving.knative.dev/v1beta1",
    kind: "DomainMapping",
    metadata: {
      name: domain,
      namespace: ctx.workloadNamespace,
    },
    spec: {
      ref: {
        name: `${site}-site`,
        kind: "Service",
        apiVersion: "serving.knative.dev/v1",
      },
      tls: {
        secretName: domain,
      },
    },
  };

  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);

  const [certificate, domainMapping] = await Promise.all([
    k8sApi.createNamespacedCustomObject(
      "cert-manager.io",
      "v1",
      ctx.workloadNamespace,
      "certificates",
      certificateManifest,
    ),
    k8sApi.createNamespacedCustomObject(
      "serving.knative.dev",
      "v1beta1",
      ctx.workloadNamespace,
      "domainmappings",
      domainMappingManifest,
    ),
  ]);
  if (
    certificate.response.statusCode &&
    certificate.response.statusCode >= 400
  ) {
    badRequest({ message: "could not create certificate" });
  }
  if (
    domainMapping.response.statusCode &&
    domainMapping.response.statusCode >= 400
  ) {
    badRequest({ message: "could not create domainMapping" });
  }
}
