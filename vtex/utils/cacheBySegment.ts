import { AppContext } from "../mod.ts";
import { getSegmentFromBag, isAnonymous } from "./segment.ts";

export const cache = "stale-while-revalidate";

// deno-lint-ignore no-explicit-any
export const cacheKey = (_props: any, _req: Request, ctx: AppContext) => {
  if (!isAnonymous(ctx)) {
    return null;
  }
  return getSegmentFromBag(ctx)?.token;
};
