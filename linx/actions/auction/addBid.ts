import type { AppContext } from "../../mod.ts";
import { CartOperation } from "../../utils/types/basket.ts";

export interface Props {
  ProductAuctionID: number;
  Amount: number;
  IsListening: boolean;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CartOperation> => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(props)) {
    fd.append(key, value);
  }
  const response = await ctx.api["POST /Shopping/ProductAuction/AddBid"]({}, {
    body: fd,
    headers: {
      "Content-Type": "multipart/form-data",
      ...req.headers,
    },
  }).then((res) => res.json());

  return response;
};

export default action;
