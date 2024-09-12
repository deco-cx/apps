import { AppContext } from "../../mod.ts";
import { allowCorsFor } from "@deco/deco";
export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
) {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });
  const response = await ctx.invoke.mailchimp.loaders.lists({ count: 20 });
  return response.lists.map((list) => ({
    label: list.name,
    value: list.id,
  }));
}
