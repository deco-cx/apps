import type { AppContext } from "../mod.ts";
import { CalculatePrices } from "../utils/graphql/queries.ts";
import type {
  CalculatePricesQuery,
  CalculatePricesQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/storefront-api-calculateprices
export default async function (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CalculatePricesQuery["calculatePrices"]> {
  const headers = parseHeaders(req.headers);

  const { calculatePrices } = await ctx.storefront.query<
    CalculatePricesQuery,
    CalculatePricesQueryVariables
  >(
    {
      variables: {
        partnerAccessToken: props.partnerAccessToken ?? "",
        products: props.products,
      },
      ...CalculatePrices,
    },
    { headers },
  );

  return calculatePrices || null;
}

type Props = {
  partnerAccessToken?: string;
  products: {
    productVariantId: number;
    quantity: number;
  }[];
};
