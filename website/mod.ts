import "./utils/unhandledRejection.ts";

import { Section } from "deco/blocks/section.ts";
import type { App, FnContext } from "deco/mod.ts";
import { asResolved } from "deco/mod.ts";
import type { Props as Seo } from "./components/Seo.tsx";
import { Routes } from "./flags/audience.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Page } from "deco/blocks/page.tsx";
import { TextReplace } from "./handlers/proxy.ts";
import { Script } from "./types.ts";
import { Matcher } from "deco/blocks/matcher.ts";

export type AppContext = FnContext<Props, Manifest>;

export type SectionProps<T> = T & { id: string };

export interface CacheDirectiveBase {
  name: string;
  value: number;
}

export interface StaleWhileRevalidate extends CacheDirectiveBase {
  name: "stale-while-revalidate";
  value: number;
}

export interface MaxAge extends CacheDirectiveBase {
  name: "max-age";
  value: number;
}

export type CacheDirective = StaleWhileRevalidate | MaxAge;

export interface Caching {
  enabled?: boolean;
  directives?: CacheDirective[];
}

export interface AbTesting {
  enabled?: boolean;
  /**
   * @description The name of the A/B test, it will be appear at cookie
   */
  name?: string;
  matcher?: Matcher;
  /**
   * @description The url to run the A/B test against, eg: secure.mywebsite.com.br
   */
  urlToRunAgainst?: string;
  /**
   * @description Strings to replace in the response, for example, to replace absolute urls at HTML
   */
  replaces?: TextReplace[];
  /**
   * @title Scripts to include
   * @description Scripts to include in the head of the page proxied
   */
  includeScriptsToHead?: {
    includes?: Script[];
  };
}

export interface Props {
  /**
   * @title Routes Map
   */
  routes?: Routes[];

  /** @title Seo */
  seo?: Omit<
    Seo,
    "jsonLDs" | "canonical"
  >;
  /**
   * @title Theme
   */
  theme?: Section;
  /**
   * @title Global Sections
   * @description These sections will be included on all website/pages/Page.ts
   */
  global?: Section[];

  /**
   * @title Error Page
   * @description This page will be used when something goes wrong beyond section error-boundaries when rendering a page
   */
  errorPage?: Page;

  /**
   * @title Caching configuration of pages
   * @description the caching configuration
   */
  caching?: Caching;

  /**
   * @title Async Rendering
   * @description Async sections will be deferred to the client-side
   * @default false
   */
  firstByteThresholdMS?: boolean;

  /**
   * @title AB Testing
   * @description A/B Testing configuration
   */
  abTesting?: AbTesting;
}

/**
 * @title Website
 */
export default function App({ theme, ...state }: Props): App<Manifest, Props> {
  const global = theme ? [...(state.global ?? []), theme] : state.global;

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
              sections: [...global ?? [], ...props.sections],
            }),
          default: (props) =>
            manifest.pages["website/pages/Page.tsx"].default({
              ...props,
              sections: [...global ?? [], ...props.sections],
            }),
        },
      },
    },
    resolvables: {
      "./routes/[...catchall].tsx": {
        __resolveType: "website/handlers/router.ts",
        audiences: [
          ...(state.abTesting ? getAbTestAudience(state.abTesting) : []),
        ],
      },
    },
  };
}

const getAbTestAudience = (abTesting: AbTesting) => {
  const handler = {
    value: {
      url: abTesting.urlToRunAgainst,
      __resolveType: "website/handlers/proxy.ts",
      customHeaders: [],
      includeScriptsToHead: abTesting.includeScriptsToHead,
      replaces: abTesting.replaces,
    },
  };

  if (abTesting.enabled) {
    return [{
      name: abTesting.name,
      routes: [
        {
          handler,
          pathTemplate: "/*",
          highPriority: true,
        },
      ],
      matcher: abTesting.matcher,
      __resolveType: "website/flags/audience.ts",
    }];
  }
  return [];
};

const deferPropsResolve = (routes: Routes): Routes => {
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

export const onBeforeResolveProps = <
  T extends { routes?: Routes[]; errorPage?: Page; abTesting: AbTesting },
>(
  props: T,
): T => {
  if (Array.isArray(props?.routes)) {
    const newRoutes: T = {
      ...props,
      errorPage: props.errorPage
        ? asResolved(props.errorPage, true)
        : undefined,
      abTesting: props.abTesting
        ? asResolved(props.abTesting, false)
        : undefined,
      routes: props.routes.map(deferPropsResolve),
    };
    return newRoutes;
  }
  return props;
};

export { default as Preview } from "./Preview.tsx";
