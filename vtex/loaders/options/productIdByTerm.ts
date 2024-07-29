import { allowCorsFor } from "deco/mod.ts";
import { AppContext } from "../../mod.ts";

interface Props {
  term?: string;
}

const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
) => {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  const suggestions = await ctx.invoke.vtex.loaders.intelligentSearch
    .suggestions({
      query: props.term || "",
      count: 6,
    });

  return suggestions?.products?.map((product) => ({
    value: `${product.productID}`,
    label: `${product.productID} - ${product.name}`,
  }));
};

export default loader;
