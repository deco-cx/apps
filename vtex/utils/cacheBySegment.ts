import { AppContext } from "../mod.ts";
import { getSegmentFromBag, isAnonymous } from "./segment.ts";

export const cache = "stale-while-revalidate";

export const cacheKey = (_req: Request, ctx: AppContext) => {
  if (!isAnonymous(ctx)) {
    return null;
  }
  return getSegmentFromBag(ctx).token;
};
