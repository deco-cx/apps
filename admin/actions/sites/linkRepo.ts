import { shortcircuit } from "deco/engine/errors.ts";
import { badRequest } from "deco/mod.ts";
import { Context } from "deco/live.ts";
import manifest from "../../manifest.gen.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  owner: string;
  repo: string;
}

const context = Context.active();

export const webhookUrl = (site: string, domain: string) =>
  `https://sites-${context.site}.${domain}/live/invoke/${manifest.name}/actions/github/webhooks/broker.ts?site=${site}`;

/**
 * Subscribe to github push and pull_requests events via webhook.
 * @title Link Repository
 */
export default async function linkRepo(
  { owner, repo, site }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const platform = await ctx.invoke["deco-sites/admin"].loaders.platforms
    .forSite({ site });
  const url = webhookUrl(site, platform.domain);
  const webhooks = await ctx.octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });
  const webhook = webhooks.data.find((webhook) => webhook.config.url === url);
  if (webhook) {
    badRequest({
      message: "repo already linked with the target site, unlink it first",
    });
    return;
  }

  try {
    await ctx.octokit.rest.repos.createWebhook({
      name: "web",
      owner,
      repo,
      config: {
        content_type: "application/json",
        secret: ctx.githubWebhookSecret,
        url,
      },
      events: ["push", "pull_request"],
    });
  } catch (err) {
    console.error("linking site error", err);
    shortcircuit(
      new Response(JSON.stringify({ message: "could not link repository" }), {
        status: 500,
      }),
    );
  }
}
