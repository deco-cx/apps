import type { AppContext } from "../../mod.ts";
import { CartOperation } from "../../utils/types/basket.ts";

export interface Props {
  productAuctionID: number;
  Amount: number;
  IsListening: boolean;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CartOperation> => {
  const cookie = req.headers.get("cookie") ?? "";

  const response = await ctx.api["POST /Shopping/ProductAuction/AddBid"](
    props,
    {
      headers: {
        cookie,
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
    },
  );

  const data = await response.json();

  return data;
};

export default action;
