import type { AppContext } from "../mod.ts";

export default (_props: unknown, req: Request, ctx: AppContext) => {
  return ctx.useCustomCheckout;
};
