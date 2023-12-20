import { GithubEventListener } from "../mod.ts";
import { controllerFor } from "./statusController.ts";

export const prEventHandler: GithubEventListener<"pull_request"> = {
  events: ["pull_request"],
  handle: async (event, ctx) => {
    const { actions, loaders } = ctx.invoke["deco-sites/admin"];
    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const commitSha = event.pull_request.head.sha;
    const site = repo; // TODO(mcandeia) it should have a way to deploy more sites to the same repo
    const context = `(beta) Deco / sites-${site} / preview`;
    const statusController = controllerFor({
      owner,
      repo,
      commitSha,
      context,
    }, ctx);
    try {
      statusController.pending();
      const currentState = await loaders.k8s.siteState({ site });
      const desiredState = { ...currentState, owner, repo, commitSha };
      const { deployment: { domains } } = await actions.sites.reconcile({
        site,
        currentState,
        desiredState,
        production: false,
      });
      statusController.suceeed(domains[0].url);
    } catch (_err) {
      statusController.failure();
      throw _err;
    }
  },
};
