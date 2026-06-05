import { allowCorsFor } from "@deco/deco";
import { searchProductOptions } from "../../core/productResolver.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  term?: string;
}

/**
 * @title Products by term
 * @description Searchable product picker for blog product blocks.
 */
export default async function productsByTerm(
  props: Props,
  req: Request,
  ctx: AppContext,
) {
  Object.entries(allowCorsFor(req)).forEach(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  return await searchProductOptions(props.term ?? "", req, ctx);
}

export const cache = "no-cache";
