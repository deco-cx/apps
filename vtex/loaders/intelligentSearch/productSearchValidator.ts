import { AppContext } from "../../mod.ts";
import { FacetsProps, Props } from "./productList.ts";
import type { Product } from "../../../commerce/types.ts";

const loader = async (
  expandedProps: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  // Call the search function with the expanded properties
  const response = await fetchProductList(ctx, expandedProps);
  if (response !== null && response.length > 0) {
    return response;
  }

  // If there are no results and 'expandedProps.props' is of type 'FacetsProps', try again without 'facets'
  if (isFacetsProps(expandedProps.props)) {
    const modifiedProps: Props = {
      ...expandedProps,
      props: { ...expandedProps.props, facets: "" },
    };
    return await fetchProductList(ctx, modifiedProps); // Tenta novamente com 'facets' removido
  }

  return null;
};

async function fetchProductList(
  ctx: AppContext,
  props: Props,
): Promise<Product[] | null> {
  const response = await ctx.invoke.vtex.loaders.intelligentSearch.productList(
    props,
  );
  return response;
}

// deno-lint-ignore no-explicit-any
function isFacetsProps(object: any): object is FacetsProps {
  return object && "facets" in object;
}

export default loader;
