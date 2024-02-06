import { AppContext } from "../mod.ts";

export interface ControllerOpts {
  owner: string;
  repo: string;
  commitSha: string;
  context: string;
}
export const controllerGroup = (
  ...controllers: ReturnType<typeof controllerFor>[]
) => {
  return {
    pending: () => {
      controllers.forEach((c) => c.pending());
    },
    succeed: (...targetUrl: string[]) => {
      controllers.forEach((c, i) => c.succeed(targetUrl[i]));
    },
    failure: (reason?: string) => {
      controllers.forEach((c) => c.failure(reason));
    },
  };
};
export const noop = {
  pending: () => {},
  succeed: () => {},
  failure: () => {},
};
export const controllerFor = (
  opts: ControllerOpts,
  ctx: AppContext,
) => {
  const { owner, repo, commitSha: commit, context } = opts;
  const { actions } = ctx.invoke["deco-sites/admin"];
  const catchIgnore = (err: unknown) => {
    console.error("failed to set github status", opts, err);
  };
  return {
    pending() {
      (async () => {
        await actions.github.setStatus({
          commit,
          repo,
          owner,
          description: "Starting deco build...",
          context,
          state: "pending",
        });
      })().catch(catchIgnore);
    },
    succeed(targetUrl: string) {
      (async () => {
        await actions.github.setStatus({
          commit,
          repo,
          owner,
          description: "Build successful",
          targetUrl,
          context,
          state: "success",
        });
      })().catch(catchIgnore);
    },
    failure(_reason?: string) {
      (async () => {
        await actions.github.setStatus({
          commit,
          repo,
          owner,
          description: "Build failed",
          context,
          state: "failure",
        });
      })().catch(catchIgnore);
    },
  };
};
