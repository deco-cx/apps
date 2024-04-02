import { Route } from "../../../../website/flags/audience.ts";

/** @titleBy from */
export interface Redirect {
  /**
   * @description Path is url pattern. https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
   * @format unused-path
   */
  from: string;
  /**
   * @description Path is url pattern. https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
   */
  to: string;
  type?: "temporary" | "permanent";
  /**
   * @title Keep Query Parameters
   */
  keepQueryParameters?: boolean;
}

export interface Redirects {
  redirects: Redirect[];
}

export default function redirect({ redirects }: Redirects): Route[] {
  const routes: Route[] = (redirects || []).map((
    { from, to, type, keepQueryParameters },
  ) => ({
    pathTemplate: from,
    isHref: true,
    handler: {
      value: {
        __resolveType: "website/handlers/redirect.ts",
        to,
        type,
        keepQueryParameters,
      },
    },
  }));

  return routes;
}
