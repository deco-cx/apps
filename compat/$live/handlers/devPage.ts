import { Page } from "deco/blocks/page.tsx";
import { context } from "deco/live.ts";
import { adminUrlFor, isAdmin } from "deco/utils/admin.ts";
import { ConnInfo } from "std/http/server.ts";
import Fresh from "../../../website/handlers/fresh.ts";
import { pageIdFromMetadata } from "../../../website/pages/Page.tsx";
import { AppContext } from "../mod.ts";

export interface DevConfig {
  page: Page;
}

/**
 * @title Private Fresh Page
 * @description Useful for pages under development.
 */
export default function DevPage(devConfig: DevConfig, ctx: AppContext) {
  const freshHandler = Fresh(devConfig, ctx);
  return (req: Request, ctx: ConnInfo) => {
    const referer = req.headers.get("origin") ?? req.headers.get("referer");
    const isOnAdmin = referer && isAdmin(referer);
    const pageId = pageIdFromMetadata(devConfig.page.metadata);

    if (
      context.isDeploy
    ) {
      if (!referer || !isOnAdmin) {
        if (pageId === -1) {
          return Response.error();
        }
        // redirect
        return Response.redirect(
          adminUrlFor(pageId, context.siteId),
        );
      }
    }
    return freshHandler(req, ctx);
  };
}
