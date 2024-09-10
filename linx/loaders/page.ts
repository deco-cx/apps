import type { Page } from "deco/blocks/page.tsx";
import { asResolved, isDeferred } from "deco/mod.ts";
import type { AppContext } from "../mod.ts";
import { LinxPage } from "./pages.ts";

interface Props {
  pages: LinxPage[];
}

/**
 * @title LINX Integration
 * @description Load Page as JSON
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Page | null> => {
  const response = await ctx.invoke("linx/loaders/path.ts");
  const [, type] = response?.PageInfo.RouteClass.split("-") ?? [];

  const match = props.pages?.find(({ selected }) => selected === type);

  return isDeferred<Page>(match?.page) ? match?.page() ?? null : null;
};

export const onBeforeResolveProps = (props: Props) => ({
  ...props,
  pages: props?.pages.map((linx) => ({
    ...linx,
    page: asResolved(linx?.page, true),
  })),
});

export default loader;
