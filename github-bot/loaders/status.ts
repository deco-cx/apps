import { AppContext } from "../mod.ts";

export default function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
) {
  return {
    discord_token: ctx.discord.token?.get() ? "✅" : "❌",
    bot: ctx.discord?.bot?.id?.toString(),
    github_token: ctx.githubToken?.get() ? "✅" : "❌",
    projects: ctx.projects.map((p) => p.github.repo_name),
  };
}
