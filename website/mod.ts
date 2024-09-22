import "./utils/unhandledRejection.ts";
import type { Props as Seo } from "./components/Seo.tsx";
import { Routes } from "./flags/audience.ts";
import { TextReplace } from "./handlers/proxy.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Script } from "./types.ts";
import { type Matcher, type Page, type Section } from "@deco/deco/blocks";
import {
  type App,
  asResolved,
  type Flag,
  type FnContext,
  type Site,
} from "@deco/deco";
declare global {
  interface Window {
    LIVE: {
      page: {
        id: string | number;
        pathTemplate?: string | undefined;
      };
      site: Site;
      flags?: Flag[];
      play?: boolean;
    };
  }
}
export type AppContext = FnContext<Props, Manifest>;
export type SectionProps<T> = T & {
  id: string;
};
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
/** @titleBy framework */
interface Fresh {
  /** @default fresh */
  framework: "fresh";
}
/** @titleBy framework */
interface HTMX {
  /** @default htmx */
  framework: "htmx";
}
export interface Props {
  /**
   * @title Routes Map
   */
  routes?: Routes[];
  /**
   * @title Global Sections
   * @description These sections will be included on the start of each page
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
   * @title Global Async Rendering (Deprecated)
   * @description Please disable this setting and enable each section individually. More info at https://deco.cx/en/blog/async-render-default
   * @deprecated true
   * @default false
   */
  firstByteThresholdMS?: boolean;
  /**
   * @title Avoid redirecting to editor
   * @description Disable going to editor when "." or "Ctrl + Shift + E" is pressed
   */
  avoidRedirectingToEditor?: boolean;
  /**
   * @title AB Testing
   * @description A/B Testing configuration
   */
  abTesting?: AbTesting;
  /**
   * @title Flavor
   * @description The flavor of the website
   */
  flavor?: Fresh | HTMX;
  /** @title Seo */
  seo?: Omit<Seo, "jsonLDs" | "canonical">;
  /**
   * @title Theme
   */
  theme?: Section;
  // We are hiding this prop because it is in testing phase
  // after that, probably we will remove this prop and default will be true
  /**
   * @hide true
   */
  sendToClickHouse?: boolean;
}
/**
 * @title Website
 */
export default function App({ ...state }: Props): App<Manifest, Props> {
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
  T extends {
    routes?: Routes[];
    errorPage?: Page;
    abTesting: AbTesting;
    global: Section[];
    theme: Section;
  },
>(props: T): T => {
  if (Array.isArray(props?.routes)) {
    const newRoutes: T = {
      ...props,
      global: props.global?.map((section) => asResolved(section, false)),
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
