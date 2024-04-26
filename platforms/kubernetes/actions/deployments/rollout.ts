import { revisionRoute } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";
import { k8s } from "../../deps.ts";

import {
  PLURAL_ROUTES,
  GROUP_SERVINGKNATIVEDEV,
  VERSION_V1,
} from "../../constants.ts";
import {
  allowScaleToZero,
  getProdRevision,
} from "../../common/knative/utils.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

interface CurrentProdRevisionBody {
  spec: {
    traffic: {
      latestRevision: boolean;
      percent: number;
      revisionName: string;
    }[];
  };
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
  const currentProdRevision = await getProdRevision({ k8sApi, site });
  const currentProdRevisionBody =
    currentProdRevision?.body as CurrentProdRevisionBody;
  const previousProdRevisionName =
    currentProdRevisionBody?.spec.traffic[0].revisionName;

  const revisionName = `${site}-site-${deploymentId}`;
  await upsertObject(
    ctx.kc,
    revisionRoute({
      routeName: Routes.prod(site),
      revisionName,
      namespace: Namespace.forSite(site),
    }),
    GROUP_SERVINGKNATIVEDEV,
    VERSION_V1,
    PLURAL_ROUTES
  );

  allowScaleToZero({ revision: previousProdRevisionName, site, ctx });
}
