import { WorkflowContext, WorkflowGen } from "deco/mod.ts";
import type { Manifest } from "../mod.ts";

export interface Props {
  owner: string;
  repo: string;
  commitSha: string;
  production: boolean;
}
const catchIgnore = (props: Props) => (err: unknown) => {
  console.error("failed to set github status", props, err);
};

export default function reconcile(
  _: unknown,
) {
  return function* (
    ctx: WorkflowContext<Manifest>,
    props: Props,
  ): WorkflowGen<void> {
    const { commitSha, repo, owner, production } = props;
    const site = repo; // TODO(mcandeia) it should have a way to deploy more sites to the same repo
    const commitCtx = `(beta) Deco / sites-${site} / ${commitSha}`;
    const prodCtx = `(beta) Deco / sites-${site} / prod`;
    const {
      actions: { github: { setStatus: st }, sites: { reconcile } },
      loaders: { k8s: { siteState } },
    } = ctx.state.invoke["deco-sites/admin"];
    const setStatus = (opts: Parameters<typeof st>[0]) =>
      st(opts).then((r) => r).catch(catchIgnore(props));
    setStatus({
      commit: commitSha,
      repo,
      owner,
      description: "Starting deco build...",
      context: commitCtx,
      state: "pending",
    });
    if (production) {
      setStatus({
        commit: commitSha,
        repo,
        owner,
        description: "Starting deco build...",
        context: prodCtx,
        state: "pending",
      });
    }
    try {
      const { deployment: { domains } } = yield ctx.callLocalActivity(
        async () => {
          const currentState = await siteState({ site });
          const desiredState = { ...currentState, owner, repo, commitSha };
          return await reconcile({
            site,
            currentState,
            desiredState,
            production,
          });
        },
      );

      setStatus({
        commit: commitSha,
        repo,
        owner,
        description: "Build successful",
        context: commitCtx,
        state: "success",
        targetUrl: domains?.[0]?.url,
      });
      if (production) {
        setStatus({
          commit: commitSha,
          repo,
          owner,
          description: "Build successful",
          context: prodCtx,
          state: "success",
          targetUrl: domains?.[1]?.url,
        });
      }
    } catch (_err) {
      setStatus({
        commit: commitSha,
        repo,
        owner,
        description: "Build has failed",
        context: commitCtx,
        state: "success",
      });
      if (production) {
        setStatus({
          commit: commitSha,
          repo,
          owner,
          description: "Build has failed",
          context: prodCtx,
          state: "failure",
        });
      }
      throw _err;
    }
  };
}
