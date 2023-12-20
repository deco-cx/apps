import { AppContext } from "../mod.ts";
import { controllerFor, controllerGroup, noop } from "./statusController.ts";

export const handleChange = async (
  owner: string,
  repo: string,
  commitSha: string,
  production: boolean,
  ctx: AppContext,
) => {
  const { actions, loaders } = ctx.invoke["deco-sites/admin"];
  const site = repo; // TODO(mcandeia) it should have a way to deploy more sites to the same repo

  const statusControllerGroup = controllerGroup(
    controllerFor({
      owner,
      repo,
      commitSha,
      context: `(beta) Deco / sites-${site} / ${commitSha}`,
    }, ctx),
    production
      ? controllerFor({
        owner,
        repo,
        commitSha,
        context: `(beta) Deco / sites-${site} / prod`,
      }, ctx)
      : noop,
  );
  try {
    statusControllerGroup.pending();
    const currentState = await loaders.k8s.siteState({ site });
    const desiredState = { ...currentState, owner, repo, commitSha };
    const { deployment: { domains } } = await actions.sites.reconcile({
      site,
      currentState,
      desiredState,
      production,
    });
    statusControllerGroup.succeed(domains[0].url, domains[1].url);
  } catch (_err) {
    statusControllerGroup.failure();
    throw _err;
  }
};
