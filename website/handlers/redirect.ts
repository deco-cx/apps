import { ConnInfo } from "std/http/mod.ts";
import { isFreshCtx } from "./fresh.ts";

export interface RedirectConfig {
  to: string;
  type?: "permanent" | "temporary";
}

/**
 * @title Redirect
 * @description Redirect request to another url
 */
export default function Redirect({ to, type = "temporary" }: RedirectConfig) {
  /** https://archive.is/kWvxu */
  const statusByRedirectType: Record<
    NonNullable<RedirectConfig["type"]>,
    number
  > = {
    "temporary": 307,
    "permanent": 301,
  };

  return (req: Request, conn: ConnInfo) => {
    const params = isFreshCtx(conn) ? conn.params ?? {} : {};
    /**
     * This allows redirects to have dynamic parameters.
     *
     * e.g: from /admin/:site to /new-admin/:site
     */
    const location = Object.keys(params).length > 0
      ? to.replace(/:[^\/]+/g, (g) => (params[g.substr(1)]))
      : to;

    const incomingUrl = new URL(req.url);
    const queryString = incomingUrl.search.slice(1);

    /**
     * This makes sure that incoming query strings are kept
     *
     * (Useful for tracking parameters e.g Google's gclid, utm_source...)
     */
    const finalLocation = !queryString
      ? location
      : location.includes("?")
      ? `${location}&${queryString}`
      : `${location}?${queryString}`;

    return new Response(null, {
      status: statusByRedirectType[type],
      headers: {
        location: finalLocation,
      },
    });
  };
}
