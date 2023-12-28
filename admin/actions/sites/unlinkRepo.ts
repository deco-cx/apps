import { AppContext } from "../../mod.ts";
import { webhookUrl } from "./linkRepo.ts";
import { shortcircuit } from "deco/engine/errors.ts";

export interface Props {
  site: string;
  owner: string;
  repo: string;
}

/**
 * @title Unlink Repository.
 */
export default async function unlink(
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
  if (!webhook) {
    return;
  }

  try {
    await ctx.octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: webhook.id,
    });
  } catch (err) {
    console.error("unlinking site error", err);
    shortcircuit(
      new Response(JSON.stringify({ message: "could not unlink repository" }), {
        status: 500,
      }),
    );
  }
}
