import type { ProductDetailsPage } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { toProductDetails } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title LINX Integration
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { slug } = props;
  const { api } = ctx;

  if (!slug) return null;

  const splitted = slug?.split("-p");
  const productID = Number(splitted[splitted.length - 1]);

  const id = productID;

  const productDetail = await api
    ["GET /web-api/v1/Catalog/Products/Get/:id"]({
      id,
    }, { deco: { cache: "stale-while-revalidate" } }).then((res) => res.json());

  return productDetail.Products.map((product) =>
    toProductDetails(ctx, product, { url, priceCurrency: "BRL" })
  )[0];
}

export default loader;
