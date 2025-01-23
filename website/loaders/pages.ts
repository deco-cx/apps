import { SiteRoute } from "../../admin/widgets.ts";
import { Route } from "../flags/audience.ts";
import { AppContext } from "../mod.ts";
import Page from "../pages/Page.tsx";

async function getAllPages(ctx: AppContext): Promise<Route[]> {
  const allPages = await ctx.get<
    Record<string, Parameters<typeof Page>[0]>
  >({
    type: "pages",
    __resolveType: "blockSelector",
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

export interface Props {
  /**
   * @title Hide pages in deco
   * @description Don't route the client to any deco page. Important: those page are still accessible if you set the "rdc=true" query string.
   */
  hidePagesInDeco?: boolean;
  /**
   * @description Deco routes that will ignore the previous rule. If the same route exists on other routes loader, the deco page will be used.
   */
  alwaysVisiblePages?: SiteRoute[];
}

/**
 * @title Pages
 */
export default async function Pages(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Route[]> {
  const allPages = await ctx.get<
    Route[]
  >({
    func: () => getAllPages(ctx),
    __resolveType: "once",
  });

  if (props?.hidePagesInDeco) {
    return allPages.map(({ pathTemplate, ...pageProps }: Route) => {
      const isException = props.alwaysVisiblePages?.some((path) =>
        path === pathTemplate
      );
      const url = new URL(pathTemplate, req.url);
      const queryString = new URLSearchParams(url.search).toString();
      const separator = queryString ? "&" : "";

      return ({
        pathTemplate: isException
          ? pathTemplate
          : `${pathTemplate}?${queryString}${separator}*rdc=true*`,
        ...pageProps,
      });
    });
  }

  return allPages;
}
