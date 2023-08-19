import { HandlerContext } from "$fresh/server.ts";
import { Page } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/page.ts";
import { RouterContext } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/types.ts";
import { allowCorsFor } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/utils/http.ts";
import { ConnInfo } from "std/http/server.ts";

export interface FreshConfig {
  page: Page;
}

export const isFreshCtx = <TState>(
  ctx: ConnInfo | HandlerContext<unknown, TState>,
): ctx is HandlerContext<unknown, TState> => {
  return typeof (ctx as HandlerContext).render === "function";
};

/**
 * @title Page
 * @description Renders a Page using Deno's Fresh.
 */
export default function Fresh(page: FreshConfig) {
  return async (req: Request, ctx: ConnInfo) => {
    const url = new URL(req.url);
    if (url.searchParams.get("asJson") !== null) {
      return Response.json(page, { headers: allowCorsFor(req) });
    }
    if (isFreshCtx<{ routerInfo: RouterContext }>(ctx)) {
      return await ctx.render({ ...page, routerInfo: ctx.state.routerInfo });
    }
    return Response.json({ message: "Fresh is not being used" }, {
      status: 500,
    });
  };
}
