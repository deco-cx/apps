import { AppContext } from "../mod.ts";
import { GetShopInfo } from "../utils/storefront/queries.ts";
import {
  CountryCode,
  LanguageCode,
  Shop,
  ShopMetafieldsArgs,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { LanguageContextArgs, Metafield } from "../utils/types.ts";

export interface Props {
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

export const defaultVisibility = "private";

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Shop> => {
  const { storefront } = ctx;
  const { metafields = [], languageCode = "PT", countryCode = "BR" } = props;

  const shop = await storefront.query<
    { shop: Shop },
    ShopMetafieldsArgs & LanguageContextArgs
  >({
    variables: { identifiers: metafields, languageCode, countryCode },
    ...GetShopInfo,
  }).then((data) => data.shop);

  return shop;
};

export default loader;
