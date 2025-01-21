import { AppContext } from "../mod.ts";

export default function doc(_: null, __: Request, ctx: AppContext) {
  return ctx.doc;
}
