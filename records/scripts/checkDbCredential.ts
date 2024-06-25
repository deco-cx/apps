import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { brightGreen } from "std/fmt/colors.ts";

const error = "Could not pull production database";

export const getDbCredentials = () => {
  const token = Deno.env.get("DATABASE_AUTH_TOKEN");
  const sitename = Deno.env.get("DECO_SITE_NAME");

  const decoAdminLinkToGetDbCredentials = `https://admin.deco.cx/sites/${
    Deno.env.get("DECO_SITE_NAME")
  }/spaces/Settings`;
  if (!token || !sitename) {
    console.log(
      `Token not setted up. Open ${
        brightGreen(decoAdminLinkToGetDbCredentials)
      } to get database credentials.`,
    );

    throw error;
  }

  const [, tokenData] = decode(token);
  const exp = (tokenData as undefined | { exp: number | undefined })
    ?.exp;
  const tokenOutdated = !!exp && new Date(exp * 1_000).getTime() < Date.now();
  if (tokenOutdated) {
    console.log(
      `Token outdated! Get new token at ${
        brightGreen(decoAdminLinkToGetDbCredentials)
      }`,
    );

    throw error;
  }

  return { token, sitename };
};
