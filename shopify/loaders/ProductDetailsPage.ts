import { ProductDetailsPage } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import { toProductPage } from "../../shopify/utils/transform.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import {
  CountryCode,
  GetProductQuery,
  GetProductQueryVariables,
  HasMetafieldsMetafieldsArgs,
  LanguageCode,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { GetProduct } from "../utils/storefront/queries.ts";
import { LanguageContextArgs, Metafield } from "../utils/types.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @title Metafields
   * @description search for metafields
   */
  metafields?: Metafield[];
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

/**
 * @title Shopify Integration
 * @description Product Details Page loader
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { storefront } = ctx;
  const { slug, languageCode = "PT", countryCode = "BR" } = props;
  const metafields = props.metafields || [];

  const splitted = slug?.split("-");
  const maybeSkuId = Number(splitted[splitted.length - 1]);

  const handle = splitted.slice(0, maybeSkuId ? -1 : undefined).join("-");

  const data = await storefront.query<
    GetProductQuery,
    GetProductQueryVariables & HasMetafieldsMetafieldsArgs & LanguageContextArgs
  >({
    variables: { handle, identifiers: metafields, languageCode, countryCode },
    ...GetProduct,
  });

  if (!data?.product) {
    return null;
  }

  return toProductPage(data.product, new URL(_req.url), maybeSkuId);
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request): string => {
  const { slug, languageCode = "PT", countryCode = "BR" } = props;

  const searchParams = new URLSearchParams({
    slug,
    languageCode,
    countryCode,
  });

  const url = new URL(req.url);
  url.search = searchParams.toString();

  return url.href;
};

export default loader;
