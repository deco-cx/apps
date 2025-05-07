import { AppContext } from "../mod.ts";

/**
 * @title Pages
 */
export default function Pages(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): string[] | undefined {
  return ctx.whilelistDomains;
}
