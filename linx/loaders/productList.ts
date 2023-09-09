import type { Product } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  /** @description total number of items to display */
  count: number;

  /** @description query to use on search */
  dataSouceID: string;

  /** @description search for term anywhere */
  // wildcard?: boolean;

  /** @description search sort parameter */
  // sort?: "newest" | "oldest" | "lowest_price" | "highest_price";

  /** @description search for products that have certain tag */
  // tags?: string[];
}

/**
 * @title LINX Integration
 * @description Product List loader
 */
const productListLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const url = new URL(req.url);
  const { api } = ctx;

  const dasourceList = await api
    ["GET /web-api/v1/Catalog/Products/Datasource/:id"]({
      id: props?.dataSouceID,
    }, { deco: { cache: "stale-while-revalidate" } }).then((res) => res.json());

  return dasourceList.Products.map((product) =>
    toProduct(ctx, product, {
      url,
      priceCurrency: "BRL",
    })
  );
};

export default productListLoader;
