import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { isProductModel } from "../../utils/paths.ts";
import { toProductDetails } from "../../utils/transform.ts";

/**
 * @title LINX Integration
 * @description Product Details Page loader
 */
async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { cdn } = ctx;

  const productID = Number(url.searchParams.get("productID")) || null;

  const response = await ctx.invoke("linx/loaders/path.ts");

  if (!response || !isProductModel(response)) {
    return null;
  }

  return toProductDetails(response, productID, { url, cdn, currency: "BRL" });
}

export default loader;
