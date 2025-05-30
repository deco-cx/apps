import { Resolved } from "@deco/deco";
import { Matcher } from "@deco/deco/blocks";
import { AppContext, AppMiddlewareContext } from "../mod.ts";

const SKIP_SIMULATION_BEHAVIOR_KEY = Symbol("skipSimulationBehavior");

export function getSkipSimulationBehaviorFromBag(ctx: AppContext) {
  return ctx.bag.get(SKIP_SIMULATION_BEHAVIOR_KEY);
}

export function setSkipSimulationBehaviorToBag(
  ctx: AppMiddlewareContext,
  skipSimulationBehavior: boolean,
) {
  ctx.bag.set(SKIP_SIMULATION_BEHAVIOR_KEY, skipSimulationBehavior);
}

export async function resolveSkipSimulationBehavior(
  ctx: AppMiddlewareContext,
  req: Request,
) {
  const { __resolveType, ...props } = ctx
    .skipSimulationBehavior as unknown as Resolved<Matcher> || {};
  if (!__resolveType) {
    return false;
  }
  const skipSimulationBehavior = await ctx.invoke(
    // @ts-ignore	ignore
    __resolveType,
    props,
  ) as Matcher;
  return skipSimulationBehavior({
    request: req,
    siteId: 0,
    device: ctx.device,
  });
}
