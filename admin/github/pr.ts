import { GithubEventListener } from "../mod.ts";
import { controllerFor } from "./statusController.ts";

export const prEventHandler: GithubEventListener<"pull_request"> = {
  events: ["pull_request"],
  handle: async (event, ctx) => {
    const { actions } = ctx.invoke["deco-sites/admin"];
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
      const [_, { domains }] = await Promise.all([
        statusController.pending(),
        actions.sites.newDeployment({
          commitSha,
          repo,
          owner,
          site,
          production: false,
        }),
      ]);
      await statusController.suceeed(domains[0].url);
    } catch (_err) {
      await statusController.failure();
    }
  },
};
