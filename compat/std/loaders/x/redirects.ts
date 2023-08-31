import { Route } from "../../../../website/flags/audience.ts";

/** @titleBy from */
export interface Redirect {
  from: string;
  to: string;
  type?: "temporary" | "permanent";
}

export interface Redirects {
  redirects: Redirect[];
}

export default function redirect(
  { redirects }: Redirects,
): Route[] {
  const routes: Route[] = (redirects || []).map((
    { from, to, type },
  ) => ({
    pathTemplate: from,
    isHref: true,
    handler: {
      value: {
        __resolveType: "website/handlers/redirect.ts",
        to,
        type,
      },
    },
  }));

  return routes;
}
