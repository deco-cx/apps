import "./utils/unhandledRejection.ts";

import { Section } from "deco/blocks/section.ts";
import type { App, FnContext } from "deco/mod.ts";
import { asResolved } from "deco/mod.ts";
import type { Props as Seo } from "./components/Seo.tsx";
import { Routes } from "./flags/audience.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

export type SectionProps<T> = T & { id: string };

export interface Props {
  /**
   * @title Site Map
   */
  routes?: Routes[];

  /** @title Seo */
  seo?: Omit<Seo, "jsonLDs">;

  /**
   * @title Global Sections
   * @description These sections will be included on all website/pages/Page.ts
   */
  global?: Section[];
}

/**
 * @title Website
 */
export default function App(
  state: Props,
): App<Manifest, Props> {
  return {
    state,
    manifest: {
      ...manifest,
      sections: {
        ...manifest.sections,
        "website/sections/Seo/Seo.tsx": {
          ...manifest.sections["website/sections/Seo/Seo.tsx"],
          Preview: (props) =>
            manifest.sections["website/sections/Seo/Seo.tsx"].Preview({
              ...state.seo,
              ...props,
            }),
          default: (props) =>
            manifest.sections["website/sections/Seo/Seo.tsx"].default({
              ...state.seo,
              ...props,
            }),
        },
      },
      pages: {
        ...manifest.pages,
        "website/pages/Page.tsx": {
          ...manifest.pages["website/pages/Page.tsx"],
          Preview: (props) =>
            manifest.pages["website/pages/Page.tsx"].Preview({
              ...props,
              sections: [...state.global ?? [], ...props.sections],
            }),
          default: (props) =>
            manifest.pages["website/pages/Page.tsx"].default({
              ...props,
              sections: [...state.global ?? [], ...props.sections],
            }),
        },
      },
    },
    resolvables: {
      "./routes/[...catchall].tsx": {
        __resolveType: "website/handlers/router.ts",
      },
    },
  };
}

const deferPropsResolve = (
  routes: Routes,
): Routes => {
  if (Array.isArray(routes)) {
    const newRoutes = [];
    for (const route of routes) {
      newRoutes.push({
        ...route,
        handler: {
          value: asResolved(route.handler.value, true),
        },
      });
    }
    return newRoutes;
  }
  return routes;
};

export const onBeforeResolveProps = <T extends { routes?: Routes[] }>(
  props: T,
): T => {
  if (Array.isArray(props?.routes)) {
    const newRoutes: T = {
      ...props,
      routes: props.routes.map(deferPropsResolve),
    };
    return newRoutes;
  }
  return props;
};
