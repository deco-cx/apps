import { Suggestion } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { Props } from "../extend.ts";

/**
 * @title VTEX Integration - Extra Info
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Omit<Props, "products">,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<Suggestion | null> =>
async (suggestion: Suggestion | null) => {
  if (suggestion == null) {
    return suggestion;
  }

  const products = await ctx.invoke(
    "vtex/loaders/product/extend.ts",
    { products: suggestion.products ?? [], ...props },
  );

  return {
    ...suggestion,
    products,
  };
};

export default loader;
