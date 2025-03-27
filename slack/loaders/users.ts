import type { AppContext } from "../mod.ts";
import type { SlackResponse, SlackUser } from "../client.ts";

export interface Props {
  /**
   * @description Maximum number of users to return (default 100, max 200)
   * @default 100
   */
  limit?: number;
  /**
   * @description Pagination cursor for next page of results
   */
  cursor?: string;
}

/**
 * @name LIST_USERS
 * @title List Users
 * @description Gets a list of all users in the workspace with their basic profile information and roles
 */
export default async function getUsers(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlackResponse<{ members: SlackUser[] }>> {
  const { limit, cursor } = props;
  return await ctx.slack.getUsers(ctx.teamId, limit, cursor);
}
