import { AppContext } from "../../mod.ts";
import { allowCorsFor } from "@deco/deco";
interface Props {
  term?: string;
}
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
  return suggestions?.products?.map((product) => ({
    value: `${product.productID}`,
    label: `${product.productID} - ${product.name}`,
    image: product.image?.[0]?.url,
  }));
};
export default loader;
