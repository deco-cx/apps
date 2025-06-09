import { AppContext } from "../../mod.ts";
import {
  getCurrentUser,
  GoogleUserInfo,
} from "../../../mcp/utils/google/userInfo.ts";

interface Props {
  accessToken?: string;
}

/**
 * @title Get Current User
 * @description Retrieves the current user's information
 */
const loader = (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GoogleUserInfo> =>
  getCurrentUser(ctx.userInfoClient, props.accessToken, "Google API");

export default loader;
