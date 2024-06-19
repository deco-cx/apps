import { AppContext } from "../mod.ts";

export default function drizzle(_: null, __: Request, ctx: AppContext) {
  return ctx.drizzle;
}
