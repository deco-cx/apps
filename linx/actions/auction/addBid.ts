import { logger } from "@deco/deco/o11y";
import { cleanResponse } from "../../../utils/http.ts";
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

  const data = await cleanResponse<CartOperation>(response);

  if (typeof data !== "object") {
    logger.error(`Failed to parse response from linx as JSON: ${data}`);
    return {
      Errors: [],
      IsValid: false,
      RefreshBasket: false,
      ResponseCallBack: {
        Code: "0",
        Parameters: [],
        Value: "",
      },
      SuccessMessage: null,
      Url: null,
      Warnings: [],
    };
  }

  return data;
};

export default action;
