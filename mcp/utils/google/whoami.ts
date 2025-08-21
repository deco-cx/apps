import type { OverrideAuthHeaderProps } from "../../oauth.ts";
import { getCurrentUser, GoogleUserInfo } from "./userInfo.ts";
import type { GoogleUserInfoClient } from "./userInfo.ts";

/**
 * @title Get Current User (Google)
 * @description Retrieves the current user's information from Google OAuth
 */
export function whoami(
  userInfoClient: GoogleUserInfoClient,
  props: OverrideAuthHeaderProps,
  apiName = "Google API",
): Promise<GoogleUserInfo> {
  return getCurrentUser(userInfoClient, props.accessToken, apiName);
}

export default whoami;
