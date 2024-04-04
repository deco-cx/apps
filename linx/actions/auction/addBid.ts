import { getCookies } from "std/http/cookie.ts";
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
  const cookies = getCookies(req.headers);
  console.log({ cookies })

  const session = cookies["_bc_hash"];
  const response = await ctx.api["POST /Shopping/ProductAuction/AddBid"](props, {
    headers: {
      ...req.headers,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
  });

  console.log({response});

  return response.json();
};

export default action;
