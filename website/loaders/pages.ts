import defaults from "$live/engine/manifest/defaults.ts";
import { Routes } from "../flags/audience.ts";
import { AppContext } from "../mod.ts";
import LivePage from "../pages/Page.tsx";

async function getAllPages(ctx: AppContext): Promise<Routes> {
  const allPages = await ctx.get<
    Record<string, Parameters<typeof LivePage>[0]>
  >({
    type: "pages",
    __resolveType: defaults["blockSelector"].name,
  });

  const routes: Routes = [];

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
export default async function Pages(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Routes> {
  const allPages = await ctx.get<
    Routes
  >({
    func: () => getAllPages(ctx),
    __resolveType: defaults["once"].name,
  });

  return allPages;
}
