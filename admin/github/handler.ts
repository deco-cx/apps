import type { WorkflowProps } from "../../workflows/actions/start.ts";
import { AppContext, Manifest } from "../mod.ts";

/**
 * Handles events from the given owner/repo/commit
 */
export const handleChange = async (
  owner: string,
  repo: string,
  commitSha: string,
  production: boolean,
  ctx: AppContext,
) => {
  const reconcile = ctx.invoke.workflows.actions.start;
  const props: WorkflowProps<
    "deco-sites/admin/workflows/reconcile.ts",
    Manifest
  > = {
    key: "deco-sites/admin/workflows/reconcile.ts",
    props: {},
    args: [{
      owner,
      repo,
      commitSha,
      production,
    }],
  };
  try {
    await reconcile(props);
  } catch (err) {
    console.error("workflow err", err);
    throw err;
  }
};
