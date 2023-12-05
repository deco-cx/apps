import { PricingRange, RefineParams } from "../../utils/types.ts";
import { AppContext } from "../../mod.ts";
import type { Product } from "../../../commerce/types.ts";
import { toProductList } from "../../utils/transform.ts";
import { toPriceRange, toRefineParams } from "../../utils/utils.ts";
import { getSession } from "../../utils/session.ts";
/**
 * @title Salesforce - Product List
 */
export interface Props {
  /**
   * @title Query
   * @description Keyphase of the collection.
   */
  q?: string;

  /**
   * @title Category ID.
   * @description Sort the categories and subcategories according to those created in the sales force. Example: men, clothes, suits
   */
  categoryID?: Array<string>;

  /**
   * @title Promotion ID.
   * @description Allows refinement per promotion ID.
   */
  pmid?: string;

  /**
   * @description Allows refinement per single price range. Multiple price ranges are not supported.
   */
  price?: PricingRange;

  /**
   * @title Extra Params.
   * @description Define extra refinement params to the query. DO NOT EXCEED 5 EXTRA PARAMS.
   * @max 5
   */
  extraParams: RefineParams[];

  /**
   * @title Sort.
   */
  sort?: Sort;

  /**
   * @description Maximum records to retrieve per request, not to exceed 50. Defaults to 25.
   * @default 10
   * @max 50
   */
  limit: number;
}

export type Sort =
  | "price-high-to-low"
  | "price-low-to-high"
  | "product-name-ascending"
  | "product-name-descending"
  | "brand"
  | "most-popular"
  | "top-sellers"
  | "";

/**
 * @title Salesforce - Product List
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  const session = getSession(ctx);
  const { slc, organizationId, siteId } = ctx;

  const { categoryID, pmid, sort, limit, q, price } = props;

  const url = new URL(req.url);

  const refine: string[] = [];

  if (categoryID?.length) {
    refine.push(`cgid=${categoryID?.join("-")}`);
  }
  if (pmid) {
    refine.push(`pmid=${pmid}`);
  }
  if (price?.minValue || price?.maxValue) {
    refine.push(`price=${toPriceRange(price)}`);
  }

  refine.push("htype=master|product");

  const refinedParams = toRefineParams(props.extraParams);

  const refinedParamsArray = Object.entries(refinedParams).map(([key, value]) =>
    `${key}=${value}`
  );
  const refinedParamsToSearch = [...refine, ...refinedParamsArray];

  console.log(refinedParamsToSearch);

  const response = await slc
    ["GET /search/shopper-search/v1/organizations/:organizationId/product-search"](
      {
        organizationId,
        siteId,
        refine: refinedParamsToSearch,
        q,
        sort,
        limit,
      },
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      },
    );

  const searchResult = await response.json();

  if (searchResult.total == 0) return null;

  return toProductList(searchResult, url.origin);
}
