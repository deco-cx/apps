import { GithubEventListener } from "../mod.ts";
import { controllerFor, controllerGroup } from "./statusController.ts";

export const pushEventHandler: GithubEventListener<"push"> = {
  events: ["push"],
  handle: async (event, ctx) => {
    const { actions, loaders } = ctx.invoke["deco-sites/admin"];
    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const commitSha = event.after;
    const site = repo; // TODO(mcandeia) it should have a way to deploy more sites to the same repo

    const statusControllerGroup = controllerGroup(
      controllerFor({
        owner,
        repo,
        commitSha,
        context: `(beta) Deco / sites-${site} / ${commitSha}`,
      }, ctx),
      controllerFor({
        owner,
        repo,
        commitSha,
        context: `(beta) Deco / sites-${site} / prod`,
      }, ctx),
    );
    try {
      statusControllerGroup.pending();
      const currentState = await loaders.k8s.siteState({ site });
      const desiredState = { ...currentState, owner, repo, commitSha };
      const { deployment: { domains } } = await actions.sites.reconcile({
        site,
        currentState,
        desiredState,
        production: true,
      });
      statusControllerGroup.suceeed(domains[0].url, domains[1].url);
    } catch (_err) {
      statusControllerGroup.failure();
      throw _err;
    }
  },
};
