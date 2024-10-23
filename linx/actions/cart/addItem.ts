import { getLinxBasketId } from "../../loaders/cart.ts";
import type { AppContext } from "../../mod.ts";
import { toLinxHeaders } from "../../utils/headers.ts";
import { toCart } from "../../utils/transform.ts";
import { CartProduct } from "../../utils/types/basket.ts";
import type { CartResponse } from "../../utils/types/basketJSON.ts";

export interface Props {
  BaseUrl?: string;
  WebSiteID?: number;
  FeatureID?: number;
  Products: CartProduct[];
  QueryString?: string;
  BasketID?: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CartResponse | null> => {
  const BasketID = getLinxBasketId(req.headers);
  try {
    const response = await ctx.api
      ["POST /web-api/v1/Shopping/Basket/AddProduct"](
        {},
        {
          body: {
            ...props,
            BasketID,
          },
          headers: toLinxHeaders(req.headers),
        },
      ).then((res) => res.json());

    const metadatas = [];
    for (const prod of props.Products) {
      if (prod.Metas && prod.Metas.length > 0) {
        const BasketItemID = response.Shopper.Basket.Items.find(
          (item) => String(item.ProductID) === prod.ProductID,
        )?.BasketItemID;

        metadatas.push(
          ctx.api["POST /web-api/v1/Shopping/Basket/AddCustomMetadata"]({}, {
            body: {
              Metas: prod.Metas,
              ProductID: prod.ProductID,
              SkuID: prod.SkuID,
              BasketItemID,
            },
            headers: toLinxHeaders(req.headers),
          }),
        );
      }
    }

    await Promise.all(metadatas);

    if (!response.IsValid) {
      console.error("Could not add Item to cart: ", response.Errors);
      return null;
    }

    const cart = await ctx.invoke("linx/loaders/cart.ts");

    return toCart({
      ...cart,
      Shopper: response.Shopper,
    } as CartResponse, { cdn: ctx.cdn });
  } catch (err) {
    console.error("Could not add Item to cart: ", err);
    return null;
  }
};

export default action;
