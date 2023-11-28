import { Suggestion } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { extend, Options } from "../../../utils/extensions/mod.ts";

/**
 * @title VTEX Integration - Extra Info
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Options,
  req: Request,
  ctx: AppContext,
): ExtensionOf<Suggestion | null> =>
async (suggestion: Suggestion | null) => {
  if (suggestion == null) {
    return suggestion;
  }

  const products = await extend(suggestion.products ?? [], props, req, ctx);

  return {
    ...suggestion,
    products,
  };
};

export default loader;
