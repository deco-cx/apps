import type { AppContext } from "../mod.ts";
import type { JiraSearchResponse } from "../client.ts";

export interface Props {
  /**
   * @description The JQL query string (e.g., 'assignee = currentUser() AND status = "In Progress"')
   */
  jql: string;
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
 * @name JQL_QUERY
 * @title JQL Query
 * @description Lists issues matching an arbitrary JQL query
 */
export default async function jqlQuery(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<JiraSearchResponse> {
  const { jql, startAt = 0, maxResults = 50 } = props;
  const result = await ctx.jira.runJql(jql, startAt, maxResults);
  return result.data;
}
