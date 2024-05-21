import { getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { DeliveryGroup } from "../../utils/types/basketJSON.ts";

export interface Props {
  ProductID: string;
  SkuID: string;
  PostalCode: string;
}

export default async function simulate(
  {
    ProductID,
    PostalCode,
    SkuID,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeliveryGroup[] | null> {
  // Get an empty basket separated from our current session
  const basketResponse = await ctx.api["POST /web-api/v1/Shopping/Basket/Get"](
    {},
    {
      body: {},
    },
  );

  // Create headers instance with the new basket session
  const setCookies = getSetCookies(basketResponse.headers);
  const baksetTktHeader = setCookies.find((cookie) => cookie.name === "tkt");
  const oneTimeBasketHeaders = new Headers();
  if (baksetTktHeader) {
    oneTimeBasketHeaders.set("cookie", `tkt=${baksetTktHeader.value}`);
  }

  const oneTimeBasket = await basketResponse.json();

  if (!oneTimeBasket.IsValid) {
    ctx.response.status = 400;
    console.error("Could not get a basket:", oneTimeBasket.Errors);
    return null;
  }

  const BasketID = oneTimeBasket.Shopper.Basket.BasketID;

  await ctx.api["POST /web-api/v1/Shopping/Basket/AddProduct"]({}, {
    headers: oneTimeBasketHeaders,
    body: {
      Products: [{
        ProductID,
        Quantity: 1,
        SkuID,
      }],
    },
  });

  const postalCodeResponse = await ctx.api
    ["POST /web-api/v1/Shopping/Basket/SetPostalCode"]({}, {
      body: {
        BasketID,
        PostalCode,
      },
    });

  const cart = await postalCodeResponse.json();

  if (!cart.IsValid) {
    ctx.response.status = 400;
    console.error("Error getting postalCodeResponse data", cart.Errors);
    return null;
  }

  return cart.Shopper.Basket.DeliveryGroups;
}
