import { getCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { CartOperation } from "../../utils/types/basket.ts";
import { LayerAPI } from "../../utils/client.ts";

export interface Props {
  ProductAuctionID: number;
  Amount: number;
  IsListening: boolean;
}

type AddBidResponse =
  LayerAPI["POST /v1/Catalog/API.svc/web/SaveProductAuctionBid"]["response"];

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AddBidResponse> => {
  // const cookies = getCookies(req.headers);
  // console.log({ cookies })

  // const session = cookies["_bc_hash"];

  const response = await ctx.layer
    ["POST /v1/Catalog/API.svc/web/SaveProductAuctionBid"]({}, {
      headers: req.headers,
      body: props,
    });
  // const response = await ctx.api["POST /Shopping/ProductAuction/AddBid"]({}, {
  //   headers: req.headers,
  //   body: props,
  // });

  console.log({ response });

  if (response.body) {
    Deno.writeFileSync(
      "output.txt",
      new TextEncoder().encode(await response.text()),
    );
  }

  return response.json();
};

export default action;
