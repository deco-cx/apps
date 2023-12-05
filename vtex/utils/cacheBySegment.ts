import { AppContext } from "../mod.ts";
import { getSegmentFromBag } from "./segment.ts";

export const cache = "stale-while-revalidate";

export const cacheKey = (_req: Request, ctx: AppContext) =>
  getSegmentFromBag(ctx).token;
