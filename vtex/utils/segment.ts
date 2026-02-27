import { setCookie } from "std/http/mod.ts";
import { AppContext } from "../mod.ts";
import type { Segment } from "./types.ts";
import { removeNonLatin1Chars } from "../../utils/normalize.ts";

const SEGMENT_COOKIE_NAME = "vtex_segment";
const SALES_CHANNEL_COOKIE = "VTEXSC";
const SEGMENT = Symbol("segment");
const ORDER_FORM_ID = Symbol("orderFormId");

export interface WrappedSegment {
  payload: Partial<Segment>;
  token: string;
}

/**
 * by default segment starts with null values
 */
const DEFAULT_SEGMENT: Partial<Segment> = {
  utmi_campaign: null,
  utmi_page: null,
  utmi_part: null,
  utm_campaign: null,
  utm_source: null,
  utm_medium: null,
  channel: "1",
  cultureInfo: "pt-BR",
  currencyCode: "BRL",
  currencySymbol: "R$",
  countryCode: "BRA",
};

const isDefautSalesChannel = (ctx: AppContext, channel?: string) => {
  return channel ===
    (ctx.salesChannel || DEFAULT_SEGMENT.channel ||
      ctx.defaultSegment?.channel);
};

export const isAnonymous = (
  ctx: AppContext,
) => {
  const payload = getSegmentFromBag(ctx)?.payload;
  if (!payload) {
    return true;
  }
  const {
    campaigns,
    utm_campaign,
    utm_source,
    utmi_campaign,
    channel,
    priceTables,
    regionId,
  } = payload;
  return !campaigns &&
    !utm_campaign &&
    !utm_source &&
    !utmi_campaign &&
    (!channel || isDefautSalesChannel(ctx, channel)) &&
    !priceTables &&
    !regionId;
};

/**
 * Checks if the segment only contains fields that don't affect page content.
 * UTMs are excluded because they're marketing tracking only — they don't
 * change prices, products, or layout. This is used for CDN cache decisions.
 */
export const isCacheableSegment = (
  ctx: AppContext,
) => {
  const payload = getSegmentFromBag(ctx)?.payload;
  if (!payload) {
    return true;
  }
  const { campaigns, channel, priceTables, regionId, channelPrivacy } = payload;
  return !campaigns &&
    (!channel || isDefautSalesChannel(ctx, channel)) &&
    !priceTables &&
    !regionId &&
    channelPrivacy !== "private";
};

const setSegmentInBag = (ctx: AppContext, data: WrappedSegment) =>
  ctx?.bag?.set(SEGMENT, data);

export const getSegmentFromBag = (
  ctx: AppContext,
): WrappedSegment => ctx?.bag?.get(SEGMENT);

export const getOrderFormIdFromBag = (
  ctx: AppContext,
): Promise<string | undefined> | undefined => ctx?.bag?.get(ORDER_FORM_ID);

export const setOrderFormIdInBag = (
  ctx: AppContext,
  orderFormId: Promise<string | undefined>,
) => ctx?.bag?.set(ORDER_FORM_ID, orderFormId);

/**
 * Creates a stable cache key from segment that only includes business-critical fields.
 * Excludes marketing/tracking parameters (UTM, UTMI) to prevent cache fragmentation.
 *
 * Use this for cacheKey generation instead of the full segment token.
 */
export const getSegmentCacheKeyWithoutUTM = (ctx: AppContext): string => {
  const segment = getSegmentFromBag(ctx)?.payload;

  if (!segment) {
    return "";
  }

  // Only include fields that affect pricing, inventory, or content
  const cacheRelevantSegment = {
    campaigns: segment.campaigns, // VTEX campaigns (can affect pricing)
    channel: segment.channel, // Sales channel (affects inventory/pricing)
    priceTables: segment.priceTables, // Price tables (affects pricing)
    regionId: segment.regionId, // Region (can affect pricing/inventory)
    currencyCode: segment.currencyCode, // Currency
    cultureInfo: segment.cultureInfo, // Locale/language
    countryCode: segment.countryCode, // Country
    channelPrivacy: segment.channelPrivacy, // Privacy settings
    // EXCLUDED: utm_campaign, utm_source, utm_medium (marketing only)
    // EXCLUDED: utmi_campaign, utmi_page, utmi_part (VTEX tracking only)
  };

  // Stable serialization for consistent cache keys
  return btoa(JSON.stringify(cacheRelevantSegment));
};
/**
 * Stable serialization.
 *
 * This means that even if the attributes are in a different order, the final segment
 * value will be the same. This improves cache hits
 */
const serialize = ({
  campaigns,
  channel,
  priceTables,
  regionId,
  utm_campaign,
  utm_source,
  utm_medium,
  utmi_campaign,
  utmi_page,
  utmi_part,
  currencyCode,
  currencySymbol,
  countryCode,
  cultureInfo,
  channelPrivacy,
}: Partial<Segment>) => {
  const seg = {
    campaigns,
    channel,
    priceTables,
    regionId,
    utm_campaign: utm_campaign &&
      removeNonLatin1Chars(utm_campaign).replace(/[\/\[\]{}()<>.]/g, ""),
    utm_source: utm_source &&
      removeNonLatin1Chars(utm_source).replace(/[\/\[\]{}()<>.]/g, ""),
    utm_medium: utm_medium &&
      removeNonLatin1Chars(utm_medium).replace(/[\/\[\]{}()<>.]/g, ""),
    utmi_campaign: utmi_campaign && removeNonLatin1Chars(utmi_campaign),
    utmi_page: utmi_page && removeNonLatin1Chars(utmi_page),
    utmi_part: utmi_part && removeNonLatin1Chars(utmi_part),
    currencyCode,
    currencySymbol,
    countryCode,
    cultureInfo,
    channelPrivacy,
  };
  return btoa(JSON.stringify(seg));
};

const parse = (cookie: string) => JSON.parse(atob(cookie));

const SEGMENT_QUERY_PARAMS = [
  "utmi_campaign" as const,
  "utmi_page" as const,
  "utmi_part" as const,
  "utm_campaign" as const,
  "utm_source" as const,
  "utm_medium" as const,
];

export const buildSegmentFromRequest = (req: Request): Partial<Segment> => {
  const url = new URL(req.url);
  const partialSegment: Partial<Segment> = {};
  for (const qs of SEGMENT_QUERY_PARAMS) {
    const param = url.searchParams.get(qs);
    if (param) {
      partialSegment[qs] = param;
    }
  }

  const sc = url.searchParams.get("sc");
  if (sc) {
    partialSegment.channel = sc;
  }

  return partialSegment;
};

export const withSegmentCookie = (
  segment: WrappedSegment,
  headers?: Headers,
) => {
  const h = new Headers(headers);
  if (!segment) {
    return h;
  }

  const { token } = segment;

  h.set("cookie", `${SEGMENT_COOKIE_NAME}=${token}`);

  return h;
};

export const setSegmentBag = (
  cookies: Record<string, string>,
  req: Request,
  ctx: AppContext,
) => {
  const vtex_segment = cookies[SEGMENT_COOKIE_NAME];
  const segmentFromCookie = vtex_segment && parse(vtex_segment);
  const segmentFromSalesChannelCookie = cookies[SALES_CHANNEL_COOKIE]
    ? {
      channel: cookies[SALES_CHANNEL_COOKIE]?.split("=")[1],
    }
    : {};
  const segmentFromRequest = buildSegmentFromRequest(req);

  const segment = {
    channel: ctx.salesChannel,
    ...DEFAULT_SEGMENT,
    ...ctx.defaultSegment,
    ...segmentFromCookie,
    ...segmentFromSalesChannelCookie,
    ...segmentFromRequest,
  };
  const token = serialize(segment);
  setSegmentInBag(ctx, { payload: segment, token });

  // Skip Set-Cookie when the segment only differs by UTMs.
  // UTMs don't affect page content, so the response can still be cached.
  // Only set cookies when content-affecting fields differ (campaigns,
  // non-default sales channel, price tables, region).
  if (!isCacheableSegment(ctx)) {
    if (segmentFromRequest.channel) {
      setCookie(ctx.response.headers, {
        value: `sc=${segmentFromRequest.channel}`,
        name: SALES_CHANNEL_COOKIE,
        path: "/",
        secure: true,
      });
    }

    if (vtex_segment !== token) {
      setCookie(ctx.response.headers, {
        value: token,
        name: SEGMENT_COOKIE_NAME,
        path: "/",
        secure: true,
        httpOnly: true,
      });
    }
  }
};
