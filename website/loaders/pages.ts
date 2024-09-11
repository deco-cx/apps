import defaults from "deco/engine/manifest/defaults.ts";
import { Route } from "../flags/audience.ts";
import { AppContext } from "../mod.ts";
import Page from "../pages/Page.tsx";

async function getAllPages(ctx: AppContext): Promise<Route[]> {
  const allPages = await ctx.get<
    Record<string, Parameters<typeof Page>[0]>
  >({
    type: "pages",
    __resolveType: defaults["blockSelector"].name,
  });

  const routes: Route[] = [];

  for (
    const [pageId, { path: pathTemplate }] of Object.entries(allPages ?? {})
  ) {
    if (!pathTemplate) {
      continue;
    }
    routes.push({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/fresh.ts",
          page: {
            __resolveType: pageId,
          },
        },
      },
    });
  }

  return routes;
}
/**
 * @title Pages
 */
export default async function Pages(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Route[]> {
  const allPages = await ctx.get<
    Route[]
  >({
    func: () => getAllPages(ctx),
    __resolveType: defaults["once"].name,
  });

  return allPages;
}
