import { AppContext } from "../mod.ts";
import { controllerFor, controllerGroup, noop } from "./statusController.ts";

/**
 * Handles events from the given owner/repo/commit
 */
export const handleChange = async (
  owner: string,
  repo: string,
  commitSha: string,
  production: boolean,
  req: Request,
  ctx: AppContext,
) => {
  const { loaders } = ctx.invoke["deco-sites/admin"];
  const reqUrl = new URL(req.url);
  const site = reqUrl.searchParams.get("site") ?? repo;
  const statusControllerGroup = controllerGroup(
    controllerFor({
      owner,
      repo,
      commitSha,
      context: `(beta) Deco / site-${site} / preview`,
    }, ctx),
    production
      ? controllerFor({
        owner,
        repo,
        commitSha,
        context: `(beta) Deco / site-${site} / prod`,
      }, ctx)
      : noop,
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
