import type { AppContext } from "../mod.ts";

export default (_props: unknown, _req: Request, ctx: AppContext) => {
  return ctx.headlessCheckout;
};
