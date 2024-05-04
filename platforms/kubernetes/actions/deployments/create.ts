import ShortUniqueId from "https://esm.sh/v135/short-unique-id@v4.4.2";
import { Deployment } from "../../../../admin/platform.ts";
import { assertsOrBadRequest } from "../../common/assertions.ts";
import { deployFromSource } from "../../common/knative/deployments.ts";
import { SiteState } from "../../loaders/siteState/get.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";

const uid = new ShortUniqueId({ length: 10, dictionary: "alpha_lower" });
export const DeploymentId = {
  new: () => uid.randomUUID(),
};

export interface Props {
  site: string;
  labels?: Record<string, string>;
  deploymentId: string;
  runnerImage?: string;
  siteState: SiteState;
  build?: boolean;
}

/**
 * Creates a new Knative Service and the route that points to it.
 * @title Create k8s Deployment
 */
export default function newDeployment(
  {
    build = true,
    site,
    deploymentId,
    labels,
    runnerImage,
    siteState: desiredState,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> {
  const siteState = ctx.withBaseState(desiredState);

  const { source } = siteState;
  assertsOrBadRequest(typeof source !== "undefined", {
    message: "source is required",
  });

  const runnerImg = runnerImage ?? siteState?.runnerImage;

  assertsOrBadRequest(typeof runnerImg !== "undefined", {
    message: "runner image is required",
  });

  const siteNs = Namespace.forSite(site);

  return deployFromSource({
    source,
    build,
    site,
    siteState,
    deploymentId,
    siteNs,
    labels,
    runnerImage: runnerImg,
  }, ctx);
}
