import { AppContext } from "../mod.ts";

export default function getSource(ctx: AppContext) {
  return !ctx.enableMobileSource || ctx.device === "desktop"
    ? "desktop"
    : "mobile";
}
