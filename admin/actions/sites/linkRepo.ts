import { context } from "deco/mod.ts";
import manifest from "../../manifest.gen.ts";
import { AppContext } from "../../mod.ts";
export interface Props {
  site: string;
  owner: string;
  repo: string;
}

/**
 * Creates a new domain for the given site.
 */
export default async function linkRepo(
  { owner, repo, site }: Props,
  _req: Request,
  ctx: AppContext,
) {
  await ctx.octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      content_type: "application/json",
      secret: ctx.githubWebhookSecret,
      url:
        `https://sites-${context.site}.${ctx.controlPlaneDomain}/live/invoke/${manifest.name}/actions/github/webhooks/broker.ts?site=${site}`,
    },
    events: ["push", "pull_request"],
  });
}
