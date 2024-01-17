import { AppContext } from "../mod.ts";
import { ShippingQuotes } from "../utils/graphql/queries.ts";
import {
  ShippingQuotesQuery,
  ShippingQuotesQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { getCartCookie } from "../utils/cart.ts";
import { HttpError } from "../../utils/http.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

export interface Props {
  cep?: string;
  simulateCartItems?: boolean;
  productVariantId?: number;
  quantity?: number;
  useSelectedAddress?: boolean;
}

const buildSimulationParams = (
  props: Props,
  checkoutId?: string,
): ShippingQuotesQueryVariables => {
  const {
    cep,
    simulateCartItems,
    productVariantId,
    quantity,
    useSelectedAddress,
  } = props;

  const defaultQueryParams = {
    cep,
    useSelectedAddress,
  };

  if (simulateCartItems) {
    if (!checkoutId) throw new HttpError(400, "Missing cart cookie");

    return {
      ...defaultQueryParams,
      checkoutId,
    };
  }

  return {
    ...defaultQueryParams,
    productVariantId,
    quantity,
  };
};

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ShippingQuotesQuery["shippingQuotes"]> => {
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const cartId = getCartCookie(req.headers);

  const simulationParams = buildSimulationParams(props, cartId);

  const data = await storefront.query<
    ShippingQuotesQuery,
    ShippingQuotesQueryVariables
  >({
    variables: {
      ...simulationParams,
    },
    ...ShippingQuotes,
  }, {
    headers,
  });

  return data.shippingQuotes ?? [];
};

export default action;
