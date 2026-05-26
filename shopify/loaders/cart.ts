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

export interface Props {
  /**
   * @title Language Code
   * @example "EN" for English, "IT" for Italian, "FR" for French.
   */
  languageCode?: LanguageCode;
  /**
   * @title Country Code
   * @description Must match an active market in Shopify Admin.
   * @example "IT" for Italy/Europe, "FR" for France.
   */
  countryCode?: CountryCode;
}

interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

const isGraphQLError = (e: unknown): e is GraphQLError =>
  typeof e === "object" && e !== null && "message" in e;

const isNotFoundError = (errors: unknown): boolean =>
  Array.isArray(errors) &&
  errors.some(
    (e) =>
      isGraphQLError(e) &&
      (e.extensions?.code === "NOT_FOUND" || e.message === "Not Found"),
  );

const createNewCart = async (
  storefront: AppContext["storefront"],
  countryCode: CountryCode,
  languageCode: LanguageCode,
): Promise<string | null> => {
  const result = await storefront.query<
    CreateCartMutation,
    CreateCartMutationVariables
  >({
    variables: { countryCode, languageCode },
    ...CreateCart,
  });

  return result.payload?.cart?.id ?? null;
};

const fetchCart = (
  storefront: AppContext["storefront"],
  cartId: string,
  countryCode: CountryCode,
  languageCode: LanguageCode,
): Promise<GetCartQuery["cart"]> =>
  storefront.query<GetCartQuery, GetCartQueryVariables>({
    variables: { id: cartId, languageCode, countryCode },
    ...GetCart,
  }).then((data) => data.cart);

const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<GetCartQuery["cart"]> => {
  const { languageCode = "PT", countryCode = "BR" } = props;
  const { storefront } = ctx;

  let cartId: string | null = getCartCookie(req.headers);

  if (!cartId) {
    cartId = await createNewCart(storefront, countryCode, languageCode);
  }

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  let cart: GetCartQuery["cart"];
  try {
    cart = await fetchCart(storefront, cartId, countryCode, languageCode);
  } catch (errors) {
    if (!isNotFoundError(errors)) throw errors;

    cartId = await createNewCart(storefront, countryCode, languageCode);
    if (!cartId) throw new Error("Failed to create replacement cart");

    cart = await fetchCart(storefront, cartId, countryCode, languageCode);
  }

  setCartCookie(ctx.response.headers, cartId);
  return cart;
};

export default loader;
