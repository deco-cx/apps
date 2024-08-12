import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { isProductModel } from "../../utils/paths.ts";
import { toProductDetails } from "../../utils/transform.ts";
import { Associations } from "../../utils/types/associationsJSON.ts";

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

  const productIDfromSearch = Number(url.searchParams.get("productID")) || null;

  const response = await ctx.invoke("linx/loaders/path.ts");

  if (!response || !isProductModel(response)) {
    return null;
  }

  const productIDfromResponse = response?.Model?.Items?.[0]?.ProductID;

  const productID = productIDfromResponse ?? productIDfromSearch;

  /**
   * Example:
   * https://joiasvip.core.dcg.com.br/widget/product_associations?ProductID=1171872&Template=~/Custom/Content/Themes/Shared/Templates/debug.template
   */
  const associations = await ctx.invoke.linx.loaders.widget({
    widget: "product_associations",
    params: {
      ProductID: String(productID),
      Template: "~/Custom/Content/Themes/Shared/Templates/debug.template",
    },
  }) as Associations | null;

  return toProductDetails(response, productID, associations, {
    url,
    cdn,
    currency: "BRL",
  });
}

export default loader;
