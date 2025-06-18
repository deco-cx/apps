import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import { CreateCart, GetCart } from "../utils/storefront/queries.ts";
import {
  CountryCode,
  CreateCartMutation,
  CreateCartMutationVariables,
  GetCartQuery,
  GetCartQueryVariables,
  LanguageCode,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { LanguageContextArgs } from "../utils/types.ts";

export interface Props {
  /**
   * @title Language Code
   * @description Language code for the storefront API
   * @example "EN" for English, "FR" for French, etc.
   */
  languageCode?: LanguageCode;
  /**
   * @title Country Code
   * @description Country code for the storefront API
   * @example "US" for United States, "FR" for France, etc.
   */
  countryCode?: CountryCode;
}

const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<GetCartQuery["cart"]> => {
  const { languageCode = "PT", countryCode = "BR" } = props;
  const { storefront } = ctx;
  const maybeCartId = getCartCookie(req.headers);

  const cartId = maybeCartId ||
    await storefront.query<CreateCartMutation, CreateCartMutationVariables>({
      variables: { countryCode },
      ...CreateCart,
    }).then((data) => data.payload?.cart?.id);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const cart = await storefront.query<
    GetCartQuery,
    GetCartQueryVariables & LanguageContextArgs
  >({
    variables: { id: decodeURIComponent(cartId), languageCode, countryCode },
    ...GetCart,
  }).then((data) => data.cart);

  setCartCookie(ctx.response.headers, cartId);

  return cart;
};

export default loader;
