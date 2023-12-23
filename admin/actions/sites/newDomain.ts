import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
export interface Props {
  site: string;
  domain: string;
}

const CLOUDFLARE_API_HOST = "https://api.cloudflare.com/client/v4";
const CLOUDFLARE_TOKEN = Deno.env.get("CLOUDFLARE_TOKEN");
const CLOUDFLARE_API_EMAIL = Deno.env.get("CLOUDFLARE_API_EMAIL");
const CLOUDFLARE_API_KEY = Deno.env.get("CLOUDFLARE_API_KEY");

const CUSTOM_HOSTNAME_POST_BODY = {
  "ssl": {
    "bundle_method": "ubiquitous",
    "method": "http",
    "type": "dv",
    "settings": {
      "ciphers": [
        "ECDHE-RSA-AES128-GCM-SHA256",
        "AES128-SHA",
      ],
      "early_hints": "on",
      "http2": "on",
      "min_tls_version": "1.2",
      "tls_1_3": "on",
    },
    "wildcard": false,
  },
};
/**
 * Creates a new domain for the given site.
 */
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
  const path = `${CLOUDFLARE_API_HOST}/zones/${ctx.cfZoneId}/custom_hostnames`;

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
    fetch(encodeURI(path), {
      method: "POST",
      body: JSON.stringify({
        "hostname": domain,
        ...CUSTOM_HOSTNAME_POST_BODY,
      }),
      headers: {
        "Authorization": `Bearer ${CLOUDFLARE_TOKEN}`,
        "Content-Type": "application/json",
        "X-Auth-Email": `${CLOUDFLARE_API_EMAIL}`,
        "X-Auth-Key": `${CLOUDFLARE_API_KEY}`,
      },
    }),
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
