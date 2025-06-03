import type { AppContext } from "../../mod.ts";
import type { JiraIssue, JiraResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The key of the Jira issue (e.g., N25-3)
   */
  issueKey: string;
}

/**
 * @name ISSUE
 * @title Get Issue
 * @description Fetches a Jira issue by its key
 */
export default async function getIssue(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<JiraResponse<JiraIssue>> {
  return await ctx.jira.getIssue(props.issueKey);
}
