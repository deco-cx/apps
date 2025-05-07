import type { AppContext } from "../../mod.ts";
import type { JiraResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The key of the Jira issue (e.g., N25-3)
   */
  issueKey: string;
  /**
   * @description The comment text to add to the issue
   */
  comment: string;
}

/**
 * @name ADD_ISSUE_COMMENT
 * @title Add Issue Comment
 * @description Adds a comment to a Jira issue
 */
export default async function addComment(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<JiraResponse<unknown>> {
  return await ctx.jira.addComment(props.issueKey, props.comment);
}
