import { AppContext } from "../mod.ts";

export default function sqlClient(
  _: null,
  __: Request,
  ctx: AppContext,
) {
  return ctx.sqlClient;
}
