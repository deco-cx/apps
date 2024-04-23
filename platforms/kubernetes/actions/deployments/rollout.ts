import { revisionRoute } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";
import { k8s } from "../../deps.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

export const Routes = {
  prod: (site: string) => `sites-${site}`,
  preview: (site: string, deploymentId: string) =>
    `${Routes.prod(site)}-${deploymentId}`,
};

/**
 * Rollout an specific deployment to production without promotion(next pushes will take changes back in prod).
 * @title Deployment Rollout
 */
export default async function rollout(
  { site, deploymentId }: Props,
  _req: Request,
  ctx: AppContext
) {
  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);

  const currentProdRevision = await k8sApi
    .getNamespacedCustomObject(
      "serving.knative.dev",
      "v1",
      Namespace.forSite(site),
      "routes",
      Routes.prod(site)
    )
    .catch((err) => {
      console.log(err);
    });

  const oldRevision = currentProdRevision.body.spec.traffic[0].revisionName;

  const revisionName = `${site}-site-${deploymentId}`;
  await upsertObject(
    ctx.kc,
    revisionRoute({
      routeName: Routes.prod(site),
      revisionName,
      namespace: Namespace.forSite(site),
    }),
    "serving.knative.dev",
    "v1",
    "routes"
  );

  const oldProdRevision = await k8sApi
    .getNamespacedCustomObject(
      "serving.knative.dev",
      "v1",
      Namespace.forSite(site),
      "revisions",
      oldRevision
    )
    .catch((err) => {
      console.log(err);
    });

  const oldProdRevisionBody = oldProdRevision.body;
  oldProdRevisionBody.metadata.annotations[
    "autoscaling.knative.dev/min-scale"
  ] = "0";

  await upsertObject(
    ctx.kc,
    oldProdRevisionBody,
    "serving.knative.dev",
    "v1",
    "revisions"
  );
}
