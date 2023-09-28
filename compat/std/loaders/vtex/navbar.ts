import type {
  Navbar,
  SiteNavigationElement,
} from "../../../../commerce/types.ts";
import { Props } from "../../../../vtex/loaders/navbar.ts";
import { VTEXContext } from "../../mod.ts";

const transform = (item: SiteNavigationElement): Navbar => {
  const img = item.image?.[0];

  const children = item.children?.map(transform);

  const nav: Navbar = {
    children,
    href: item.url!,
    label: item.name!,
    image: img
      ? {
        src: img.url,
        alt: img.alternateName,
      }
      : undefined,
  };

  return nav;
};

/**
 * @title Navbar
 * @deprecated true
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: VTEXContext,
): Promise<Navbar[] | null> => {
  const navbar = await ctx.invoke.vtex.loaders.navbar(props);

  return navbar?.map(transform) ?? null;
};

export default loader;
