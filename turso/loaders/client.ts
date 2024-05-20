import { AppContext } from "../mod.ts";

export default function client(_: null, __: Request, ctx: AppContext) {
  return ctx.client;
}
