import { AppContext } from "../mod.ts";
import { STALE } from "../../utils/fetch.ts";
import {
  withSegmentCookie,
  withSegmentParams,
  type WrappedSegment,
} from "./segment.ts";
import type {
  FacetSearchResult,
  ProductSearchResult,
  SelectedFacet,
  SimulationBehavior,
  Sort,
  Suggestion,
} from "../utils/types.ts";

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
  facets.map(({ key, value }) => key ? `${key}/${value}` : value).join("/");

interface Params {
  query: string;
  page: number;
  count: number;
  sort: Sort;
  fuzzy: string;
  locale: string;
  hideUnavailableItems: boolean;
  simulationBehavior: SimulationBehavior;
}

export const withDefaultParams = ({
  query = "",
  page = 0,
  count = 12,
  sort = "",
  fuzzy = "",
  locale = "pt-BR",
  hideUnavailableItems,
  simulationBehavior = "default",
}: Partial<Params>) => ({
  page: page + 1,
  count,
  query,
  sort,
  ...(fuzzy ? { fuzzy } : {}),
  locale,
  // locale: locale ?? ctx.configVTEX!.defaultLocale,
  hideUnavailableItems: hideUnavailableItems ?? false,
  simulationBehavior,
});

/**
 * Whether the store opted in to the VTEX Intelligent Search API v1 (via the
 * `intelligentSearchV1` app flag). When off, the legacy Intelligent Search
 * endpoints are used.
 */
export const isIntelligentSearchV1 = (ctx: AppContext): boolean =>
  ctx.intelligentSearchV1 ?? false;

type DefaultParams = ReturnType<typeof withDefaultParams>;

/**
 * Runs a product search on the Intelligent Search API, picking the v1 or the
 * legacy endpoint based on the `intelligentSearchV1` flag. v1 forwards the
 * segment context as explicit query params; the legacy API reads it from the
 * segment cookie.
 */
export const searchProducts = (
  ctx: AppContext,
  segment: WrappedSegment | null | undefined,
  params: DefaultParams,
  facets: string,
): Promise<ProductSearchResult> => {
  const { vcsDeprecated } = ctx;

  if (isIntelligentSearchV1(ctx)) {
    return vcsDeprecated
      ["GET /api/intelligent-search/v1/product-search/*facets"]({
        ...params,
        ...withSegmentParams(segment),
        facets,
      }, STALE).then((res) => res.json());
  }

  return vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
      ...params,
      facets,
    }, {
      ...STALE,
      headers: segment ? withSegmentCookie(segment) : undefined,
    }).then((res) => res.json());
};

/**
 * Runs a facets search on the Intelligent Search API (v1 or legacy).
 */
export const searchFacets = (
  ctx: AppContext,
  segment: WrappedSegment | null | undefined,
  params: DefaultParams,
  facets: string,
): Promise<FacetSearchResult> => {
  const { vcsDeprecated } = ctx;

  if (isIntelligentSearchV1(ctx)) {
    return vcsDeprecated["GET /api/intelligent-search/v1/facets/*facets"]({
      ...params,
      ...withSegmentParams(segment),
      facets,
    }, STALE).then((res) => res.json());
  }

  return vcsDeprecated["GET /api/io/_v/api/intelligent-search/facets/*facets"]({
    ...params,
    facets,
  }, {
    ...STALE,
    headers: segment ? withSegmentCookie(segment) : undefined,
  }).then((res) => res.json());
};

/**
 * Fetches search term suggestions (v1 or legacy). v1 only accepts locale/query.
 */
export const searchSuggestions = (
  ctx: AppContext,
  segment: WrappedSegment | null | undefined,
  { locale, query }: { locale: string; query: string },
): Promise<Suggestion> => {
  const { vcsDeprecated } = ctx;

  if (isIntelligentSearchV1(ctx)) {
    return vcsDeprecated["GET /api/intelligent-search/v1/search-suggestions"]({
      locale,
      query,
    }).then((res) => res.json());
  }

  return vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/search_suggestions"]({
      locale,
      query,
    }, { headers: segment ? withSegmentCookie(segment) : undefined })
    .then((res) => res.json());
};

/**
 * Fetches the store's top searches (v1 or legacy). v1 only accepts locale.
 */
export const topSearches = (
  ctx: AppContext,
  segment: WrappedSegment | null | undefined,
  { locale }: { locale: string },
): Promise<Suggestion> => {
  const { vcsDeprecated } = ctx;

  if (isIntelligentSearchV1(ctx)) {
    return vcsDeprecated["GET /api/intelligent-search/v1/top-searches"]({
      locale,
    }, STALE).then((res) => res.json());
  }

  return vcsDeprecated["GET /api/io/_v/api/intelligent-search/top_searches"]({
    locale,
  }, {
    ...STALE,
    headers: segment ? withSegmentCookie(segment) : undefined,
  }).then((res) => res.json());
};

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
  }

  if (!session) {
    session = crypto.randomUUID();
  }

  ctx?.bag.set(IS_ANONYMOUS, anonymous);
  ctx?.bag.set(IS_SESSION, session);

  return {
    anonymous,
    session,
  };
};

/**
 * @description keyFilter is the querystring names which can be vtex filter parameter
 */
export const isFilterParam = (keyFilter: string): boolean =>
  keyFilter.startsWith("filter.");

const segmentsFromTerm = (term: string) => term.split("/").filter(Boolean);

const segmentsFromSearchParams = (url: string) => {
  const searchParams = new URLSearchParams(url).entries();

  const categories = Array.from(searchParams).toSorted()
    .reduce((acc, [key, value]) => {
      if (key.includes("filter.category")) {
        acc.push(value);
      }

      return acc;
    }, [] as string[]);

  return categories.length ? categories : segmentsFromTerm(url);
};

export const pageTypesFromUrl = async (
  url: string,
  ctx: AppContext,
) => {
  const segments = segmentsFromSearchParams(url);
  const { vcsDeprecated } = ctx;

  return await Promise.all(
    segments.map((_, index) =>
      vcsDeprecated["GET /api/catalog_system/pub/portal/pagetype/:term"]({
        term: segments.slice(0, index + 1).join("/"),
      }, STALE).then((res) => res.json())
    ),
  );
};
