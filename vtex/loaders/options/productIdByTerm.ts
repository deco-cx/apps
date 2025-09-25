import { AppContext } from "../../mod.ts";
import { allowCorsFor } from "@deco/deco";
interface Props {
  term?: string;
}

interface DynamicOptionsReturn {
  value: string;
  label: string;
  image?: string;
}

/**
 * @title Product ID by Term
 * @description List a product ID by term
 */
const loader = async (props: Props, req: Request, ctx: AppContext) => {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });
  const suggestions = await ctx.invoke.vtex.loaders.intelligentSearch
    .suggestions({
      query: props.term || "",
      count: 10,
    });
  if (suggestions?.products?.length === 0) {
    return [{
      value: "No products found, use search",
      label: "No products found, use search",
    }];
  }

  let suggestionsArray: DynamicOptionsReturn[] = [];

  suggestions?.products?.forEach((product) => {
    const variants = product.isVariantOf?.hasVariant?.map((variant) => {
      return {
        value: `${variant.productID}`,
        label:
          `${variant.productID} - ${product.isVariantOf?.name} ${variant.name} - ${product.isVariantOf?.productGroupID}`,
        image: variant.image?.[0]?.url,
      };
    }) || [];
    suggestionsArray = suggestionsArray.concat(variants);
  });

  return suggestionsArray;
};
export default loader;
