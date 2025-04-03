import type { AppContext } from "../../mod.ts";
import type { SlackResponse, SlackUserProfile } from "../../client.ts";

export interface Props {
  /**
   * @description The ID of the user to fetch profile information for
   */
  userId: string;
}

/**
 * @name USER_PROFILE
 * @title User Profile
 * @description Gets detailed profile information for a specific user including their status, display name, and contact information
 */
export default async function getUserProfile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlackResponse<{ profile: SlackUserProfile }>> {
  const { userId } = props;
  return await ctx.slack.getUserProfile(userId);
}
