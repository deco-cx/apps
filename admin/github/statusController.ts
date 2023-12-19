import { AppContext } from "../mod.ts";

export interface ControllerOpts {
  owner: string;
  repo: string;
  commitSha: string;
  context: string;
}
export const controllerFor = (
  { owner, repo, commitSha: commit, context }: ControllerOpts,
  ctx: AppContext,
) => {
  const { actions } = ctx.invoke["deco-sites/admin"];
  return {
    async pending() {
      await actions.github.setStatus({
        commit,
        repo,
        owner,
        description: "Starting deco build...",
        context,
        state: "pending",
      });
    },
    async suceeed(targetUrl: string) {
      await actions.github.setStatus({
        commit,
        repo,
        owner,
        description: "Build successful",
        targetUrl,
        context,
        state: "pending",
      });
    },
    async failure(_reason?: string) {
      await actions.github.setStatus({
        commit,
        repo,
        owner,
        description: "Build failure",
        context,
        state: "failure",
      });
    },
  };
};
