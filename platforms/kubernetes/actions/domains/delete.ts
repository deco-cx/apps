import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";

export interface Props {
  site: string;
  domain: string;
}

/**
 * Deletes a domain for the given site.
 * @title Domain Delete
 */
export default async function deleteDomain(
  { site, domain }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);
  const siteNs = Namespace.forSite(site);

  const [_certificate, _domainMapping, currentSiteState] = await Promise.all([
    k8sApi.deleteNamespacedCustomObject(
      "cert-manager.io",
      "v1",
      siteNs,
      "certificates",
      domain,
    ),
    k8sApi.deleteNamespacedCustomObject(
      "serving.knative.dev",
      "v1beta1",
      siteNs,
      "domainmappings",
      domain,
    ),
    ctx.invoke.kubernetes.loaders.siteState.get({ site }),
  ]);

  if (!currentSiteState) {
    badRequest({ message: "site not found" });
    return;
  }

  await ctx.invoke.kubernetes.actions.siteState.upsert({
    site,
    state: {
      ...currentSiteState,
      domains: (currentSiteState.domains ?? []).filter(({ url }) =>
        url !== domain
      ),
    },
  });
}
