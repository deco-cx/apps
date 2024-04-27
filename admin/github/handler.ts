import { AppContext } from "../mod.ts";
import { controllerFor, controllerGroup } from "./statusController.ts";
import urlSlug from "npm:url-slug@4.0.1";
/**
 * Handles events from the given owner/repo/commit
 */
export const handleChange = async (
  owner: string,
  repo: string,
  commitSha: string,
  branch: string,
  req: Request,
  ctx: AppContext,
) => {
  const production = branch === "main"; // FIXME (@mcandeia) hopefully people won't change their default branches
  const branchSlug = urlSlug.convert(branch);
  const { loaders } = ctx.invoke["deco-sites/admin"];
  const reqUrl = new URL(req.url);
  const site = reqUrl.searchParams.get("site") ?? repo;
  const statusControllerGroup = controllerGroup(
    controllerFor({
      owner,
      repo,
      commitSha,
      context: `Deco / site-${site} / commit`,
    }, ctx),
    production
      ? controllerFor({
        owner,
        repo,
        commitSha,
        context: `Deco / site-${site} / prod`,
      }, ctx)
      : controllerFor({
        owner,
        repo,
        commitSha,
        context: `Deco / site-${site} / ${branchSlug}`,
      }, ctx),
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
      slug: !production ? branchSlug : undefined,
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
