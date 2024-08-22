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
  try {
    const url = new URL(req.url);
    const { cdn } = ctx;

    const productIDfromSearch = Number(url.searchParams.get("productID")) ||
      null;

    const response = await ctx.invoke("linx/loaders/path.ts");

    if (!response || !isProductModel(response)) {
      return null;
    }

    const productIDfromResponse = response?.Model?.ProductID;
    const productID = productIDfromResponse ?? productIDfromSearch;

    let associations: Associations | null = null;
    try {
      /**
       * Example:
       * https://joiasvip.core.dcg.com.br/widget/product_associations?ProductID=1171872&Template=~/Custom/Content/Themes/Shared/Templates/debug.template
       */
      associations = await ctx.invoke.linx.loaders.widget({
        widget: "product_associations",
        params: {
          ProductID: String(productID),
          Template: "~/Custom/Content/Themes/Shared/Templates/debug.template",
        },
      }) as Associations | null;
    } catch (_) {
      associations = null;
    }

    return toProductDetails(response, productID, associations, {
      url,
      cdn,
      currency: "BRL",
    });
  } catch (_) {
    return null;
  }
}

export default loader;
