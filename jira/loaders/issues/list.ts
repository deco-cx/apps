import type { JiraSearchResponse } from "../../client.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description The key of the Jira project (e.g., N25)
   */
  project: string;
  /**
   * @description The index of the first issue to return (for pagination)
   * @default 0
   */
  startAt?: number;
  /**
   * @description The maximum number of issues to return (for pagination)
   * @default 50
   */
  maxResults?: number;
}

/**
 * @name LIST_ISSUES
 * @title List Project Issues
 * @description Lists issues of a given Jira project
 */
export default async function listIssues(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<JiraSearchResponse> {
  const { project, startAt = 0, maxResults = 50 } = props;
  const jql = `project = ${project}`;
  const result = await ctx.jira.runJql(jql, startAt, maxResults);
  return result.data;
}
