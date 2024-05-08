import urlSlug from "npm:url-slug@4.0.1";
import { AppContext } from "../mod.ts";
import { controllerFor, controllerGroup } from "./statusController.ts";

export const handlePrClose = async (
  repo: string,
  ref: string,
  req: Request,
  ctx: AppContext,
) => {
  const reqUrl = new URL(req.url);
  const site = reqUrl.searchParams.get("site") ?? repo;
  const refSlug = urlSlug.convert(ref);
  const { loaders } = ctx.invoke["deco-sites/admin"];
  const platform = await loaders.platforms.forSite({ site }).then((p) => p)
    .catch((_err) => {
      return null;
    });
  if (platform === null) {
    return;
  }
  await platform.deployments.delete({ slug: refSlug, site });
};
/**
 * Handles events from the given owner/repo/commit
 */
export const handleChange = async (
  owner: string,
  repo: string,
  commitSha: string,
  ref: string,
  req: Request,
  ctx: AppContext,
) => {
  const production = ref === "main"; // FIXME (@mcandeia) hopefully people won't change their default branches
  const refSlug = urlSlug.convert(ref);
  const { loaders } = ctx.invoke["deco-sites/admin"];
  const reqUrl = new URL(req.url);
  const site = reqUrl.searchParams.get("site") ?? repo;
  const controllers = production
    ? [
      controllerFor({
        owner,
        repo,
        commitSha,
        context: `Deco / site-${site} / prod`,
      }, ctx),
    ]
    : [
      controllerFor({
        owner,
        repo,
        commitSha,
        context: `Deco / site-${site} / ${refSlug}`,
      }, ctx),
    ];
  const statusControllerGroup = controllerGroup(
    ...controllers,
  );
  try {
    const platform = await loaders.platforms.forSite({ site }).then((p) => p)
      .catch((_err) => {
        return null;
      });
    if (platform === null) {
      return;
    }
    statusControllerGroup.pending();
    const { domains } = await platform.deployments.create({
      mode: "repo",
      commitSha,
      owner,
      slug: !production ? refSlug : undefined,
      repo,
      site,
      production,
    });
    statusControllerGroup.succeed(domains?.[0]?.url, domains?.[1]?.url);
  } catch (_err) {
    statusControllerGroup.failure();
    throw _err;
  }
};
