import { GithubEventListener } from "../mod.ts";
import { controllerFor } from "./statusController.ts";

export const pushEventHandler: GithubEventListener<"push"> = {
  events: ["push"],
  handle: async (event, ctx) => {
    const { actions } = ctx.invoke["deco-sites/admin"];
    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const commitSha = event.after;
    const site = repo; // TODO(mcandeia) it should have a way to deploy more sites to the same repo
    const prodContext = `(beta) Deco / sites-${site} / prod`;
    const commitContext = `(beta) Deco / sites-${site} / ${commitSha}`;

    const commitStatusController = controllerFor({
      owner,
      repo,
      commitSha,
      context: commitContext,
    }, ctx);
    const prodStatusController = controllerFor({
      owner,
      repo,
      commitSha,
      context: prodContext,
    }, ctx);
    try {
      const [_, __, { domains }] = await Promise.all([
        commitStatusController.pending(),
        prodStatusController.pending(),
        actions.sites.newDeployment({
          commitSha,
          repo,
          owner,
          site,
          production: true,
        }),
      ]);
      await Promise.all([
        prodStatusController.suceeed(domains[1].url),
        commitStatusController.suceeed(domains[0].url),
      ]);
    } catch (_err) {
      await Promise.all([
        prodStatusController.failure(),
        commitStatusController.failure(),
      ]);
    }
  },
};
