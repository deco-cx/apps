import type { OverrideAuthHeaderProps } from "../../../mcp/oauth.ts";
import {
  getCurrentUser,
  GoogleUserInfo,
} from "../../../mcp/utils/google/userInfo.ts";
import { AppContext } from "../../mod.ts";

/**
 * @title Get Current User
 * @description Retrieves the current user's information
 */
const loader = (
  props: OverrideAuthHeaderProps,
  _req: Request,
  ctx: AppContext,
): Promise<GoogleUserInfo> =>
  getCurrentUser(ctx.userInfoClient, props.accessToken, "Gmail API");

export default loader;
