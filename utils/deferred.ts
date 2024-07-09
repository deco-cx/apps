import { __DECO_FBT } from "../website/handlers/fresh.ts";

export const shouldForceRender = <Ctx extends { isBot?: boolean }>(
  { ctx, searchParams }: { ctx: Ctx; searchParams: URLSearchParams },
): boolean => ctx.isBot || searchParams.get(__DECO_FBT) === "0";
