import { AppContext } from "../mod.ts";

export const withDigestCookie = ({ storefrontDigestCookie }: AppContext) =>
  storefrontDigestCookie
    ? [{
      key: "cookie",
      value: `storefront_digest=${storefrontDigestCookie}`,
    }]
    : undefined;
