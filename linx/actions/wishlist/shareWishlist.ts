import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  WishlistID: number
  WebSiteID?: number
  Recipients: string
  Message: string
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<unknown | null> => {
  const { layer } = ctx;

  const response = await layer["POST	/v1/Profile/API.svc/web/ShareWishlist"](
    {},
    {
      body: props,
    }
  );

  const data = await response.json().catch(nullOnNotFound);

  if (!data) {
    return null;
  }

  return data;
};

export default action;
