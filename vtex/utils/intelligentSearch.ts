import { setCookie } from "std/http/mod.ts";
import { AppContext } from "../mod.ts";
import type { SelectedFacet, Sort } from "../utils/types.ts";

export const SESSION_COOKIE = "vtex_is_session";
export const ANONYMOUS_COOKIE = "vtex_is_anonymous";

// const POLICY_KEY = "trade-policy";
// const REGION_KEY = "region-id";
// const CHANNEL_KEYS = new Set([POLICY_KEY, REGION_KEY]);

export const withDefaultFacets = (
  allFacets: readonly SelectedFacet[],
  _ctx: AppContext,
) => {
  // const { defaultSalesChannel, defaultRegionId } = ctx!;
  // const facets = allFacets.filter(({ key }) => !CHANNEL_KEYS.has(key));

  // const policyFacet = allFacets.find(({ key }) => key === POLICY_KEY) ??
  //   { key: POLICY_KEY, value: defaultSalesChannel ?? "" };

  // const regionFacet = allFacets.find(({ key }) => key === REGION_KEY) ??
  //   { key: REGION_KEY, value: defaultRegionId ?? "" };

  // if (policyFacet !== null) {
  //   facets.push(policyFacet);
  // }

  // if (regionFacet !== null) {
  //   facets.push(regionFacet);
  // }

  // return facets;
  return [...allFacets];
};

export const toPath = (facets: SelectedFacet[]) =>
  facets.map(({ key, value }) => `${key}/${value}`).join("/");

interface Params {
  query: string;
  page: number;
  count: number;
  sort: Sort;
  fuzzy: string;
  locale: string;
  hideUnavailableItems: boolean;
}

export const withDefaultParams = ({
  query = "",
  page = 0,
  count = 12,
  sort = "",
  fuzzy = "auto",
  // locale,
  hideUnavailableItems,
}: Partial<Params>) => ({
  page: page + 1,
  count,
  query,
  sort,
  fuzzy,
  // locale: locale ?? ctx.configVTEX!.defaultLocale,
  hideUnavailableItems: hideUnavailableItems ?? false,
});

const IS_ANONYMOUS = Symbol("segment");
const IS_SESSION = Symbol("segment");

export const getISCookiesFromBag = (ctx: AppContext) => {
  const anonymous = ctx?.bag.get(IS_ANONYMOUS);
  const session = ctx?.bag.get(IS_SESSION);

  if (anonymous && session) {
    return {
      anonymous,
      session,
    };
  }

  return null;
};

export const setISCookiesBag = (
  cookies: Record<string, string>,
  ctx: AppContext,
) => {
  let anonymous = cookies[ANONYMOUS_COOKIE];
  let session = cookies[SESSION_COOKIE];

  if (!anonymous) {
    anonymous = crypto.randomUUID();

    setCookie(ctx.response.headers, {
      value: anonymous,
      name: ANONYMOUS_COOKIE,
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 365 * 24 * 3600,
    });
  }

  if (!session) {
    session = crypto.randomUUID();

    setCookie(ctx.response.headers, {
      value: session,
      name: SESSION_COOKIE,
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 30 * 60,
    });
  }

  ctx?.bag.set(IS_ANONYMOUS, anonymous);
  ctx?.bag.set(IS_SESSION, session);

  return {
    anonymous,
    session,
  };
};
