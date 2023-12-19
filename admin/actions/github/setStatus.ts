import { AppContext } from "../../mod.ts";

export interface Props {
  commit: string;
  repo: string;
  owner: string;
  description: string;
  targetUrl: string;
  context: string;
  state: "pending" | "failure" | "success";
}

export default async function setStatus(
  { commit, repo, owner, description, targetUrl, context, state }: Props,
  _req: Request,
  ctx: AppContext,
) {
  await ctx.octokit.rest.repos.createCommitStatus({
    sha: commit,
    repo,
    owner,
    description,
    target_url: targetUrl,
    context,
    state,
  });
}
