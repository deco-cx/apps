import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { Routes } from "../deployments/rollout.ts";
import { Namespace } from "../sites/create.ts";

export interface Props {
  site: string;
  domain: string;
  ephemeral?: boolean;
}

/**
 * Creates a new domain for the given site.
 * @title Create Domain
 */
export default async function newDomain(
  { site, domain, ephemeral }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const siteNs = Namespace.forSite(site);
  const certificateManifest = {
    apiVersion: "cert-manager.io/v1",
    kind: "Certificate",
    metadata: {
      name: domain,
      namespace: siteNs,
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
      namespace: siteNs,
    },
    spec: {
      ref: {
        name: Routes.prod(site),
        kind: "Route",
        apiVersion: "serving.knative.dev/v1",
      },
      tls: {
        secretName: domain,
      },
    },
  };

  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);
  const currentSitePromise = ctx.invoke.kubernetes.loaders.siteState.get({
    site,
  });

  await Promise.all([
    k8sApi.createNamespacedCustomObject(
      "cert-manager.io",
      "v1",
      siteNs,
      "certificates",
      certificateManifest,
    ),
    k8sApi.createNamespacedCustomObject(
      "serving.knative.dev",
      "v1beta1",
      siteNs,
      "domainmappings",
      domainMappingManifest,
    ),
  ]);
  if (ephemeral) {
    return;
  }
  const currentSiteState = await currentSitePromise;

  if (!currentSiteState) {
    badRequest({ message: "site not found" });
    return;
  }

  await ctx.invoke.kubernetes.actions.siteState.upsert({
    site,
    state: {
      ...currentSiteState,
      domains: [...currentSiteState.domains ?? [], {
        url: domain,
        production: true,
      }],
    },
  });
}
