import { HandlerContext } from "$fresh/server.ts";
import { Page } from "deco/blocks/page.ts";
import { DecoState } from "deco/types.ts";
import { allowCorsFor } from "deco/utils/http.ts";
import { ConnInfo } from "std/http/server.ts";

/**
 * @title Fresh Config
 */
export interface FreshConfig {
  page: Page;
}

export const isFreshCtx = <TState>(
  ctx: ConnInfo | HandlerContext<unknown, TState>,
): ctx is HandlerContext<unknown, TState> => {
  return typeof (ctx as HandlerContext).render === "function";
};

/**
 * @title Fresh Page
 * @description Renders a fresh page.
 */
export default function Fresh(page: FreshConfig) {
  return async (req: Request, ctx: ConnInfo) => {
    const url = new URL(req.url);
    if (url.searchParams.get("asJson") !== null) {
      return Response.json(page, { headers: allowCorsFor(req) });
    }
    if (isFreshCtx<DecoState>(ctx)) {
      return await ctx.render({
        ...page,
        routerInfo: {
          flags: ctx.state.flags,
          pagePath: ctx.state.pathTemplate,
        },
      });
    }
    return Response.json({ message: "Fresh is not being used" }, {
      status: 500,
    });
  };
}
