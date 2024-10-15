import type { Route } from "../../website/flags/audience.ts";
import type { AppContext } from "../mod.ts";
import { type Page } from "@deco/deco/blocks";
import { asResolved } from "@deco/deco";
/** @titleBy selected */
export interface LinxPage {
  selected: "category" | "search" | "product";
  page: Page;
}
interface Props {
  pages: LinxPage[];
}
const PROXY_PATHS = [
  "/carrinho",
  "/carrinho/*",
  "/App/*",
  "/app/*",
  "/Analytics/*",
  "/analytics/*",
  "/widget/*",
  "/checkout/easy",
  "/cadastro",
  "/cadastro/*",
  "/Custom/*",
  "/custom/*",
  "/login",
  "/painel-do-cliente",
  "/painel-do-cliente/*",
];
/**
 * @title Linx Pages
 */
const loader = (props: Props, _req: Request, ctx: AppContext): Route[] => [
  {
    pathTemplate: "/*",
    handler: {
      value: {
        __resolveType: "website/handlers/fresh.ts",
        page: {
          __resolveType: "linx/loaders/page.ts",
          pages: props.pages,
        },
      },
    },
  },
  ...PROXY_PATHS.map((pathTemplate) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: `https://${ctx.account}.core.dcg.com.br/`,
      },
    },
  })),
];
export const onBeforeResolveProps = (props: Props) => ({
  ...props,
  pages: props?.pages.map((linx) => ({
    ...linx,
    page: asResolved(linx?.page),
  })),
});
export default loader;
