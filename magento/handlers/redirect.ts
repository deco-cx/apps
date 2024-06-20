import { ConnInfo } from "std/http/mod.ts";

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

    return (req: Request, _conn: ConnInfo) => {
        const incomingUrl = new URL(req.url);

        const location = to + incomingUrl.pathname;
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

        console.log(finalLocation)
        return new Response(null, {
            status: statusByRedirectType[type],
            headers: {
                location: finalLocation,
            },
        });
    };
}
