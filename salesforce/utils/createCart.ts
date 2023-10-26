import { Basket } from "./types.ts";
import { AppContext } from "../mod.ts";

export interface Props {
  token: string;
}

export default async function createCart(
  token: string,
  ctx: AppContext,
): Promise<null | Basket> {
  const { slc, organizationId, siteId } = ctx;

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  });

  const response = await slc
    ["POST /checkout/shopper-baskets/v1/organizations/:organizationId/baskets"](
      {
        organizationId,
        siteId: siteId,
      },
      {
        body: {},
        headers: headers,
      },
    );

  return response.json();
}
