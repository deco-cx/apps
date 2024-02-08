import { setCookie } from "std/http/mod.ts";
import { AppContext } from "../mod.ts";
import type { Segment } from "./types.ts";
import { removeNonLatin1Chars } from "../../utils/normalize.ts";

const SEGMENT_COOKIE_NAME = "vtex_segment";
const SEGMENT = Symbol("segment");

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

const setSegmentInBag = (ctx: AppContext, data: WrappedSegment) =>
  ctx?.bag?.set(SEGMENT, data);

export const getSegmentFromBag = (
  ctx: AppContext,
): WrappedSegment => ctx?.bag?.get(SEGMENT);

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
    utm_campaign: utm_campaign && removeNonLatin1Chars(utm_campaign),
    utm_source: utm_source && removeNonLatin1Chars(utm_source),
    utm_medium: utm_medium && removeNonLatin1Chars(utm_medium),
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

export const buildSegmentCookie = (req: Request): Partial<Segment> => {
  const url = new URL(req.url);
  const partialSegment: Partial<Segment> = {};
  for (const qs of SEGMENT_QUERY_PARAMS) {
    const param = url.searchParams.get(qs);
    if (param) {
      partialSegment[qs] = param;
    }
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
  const segmentFromRequest = buildSegmentCookie(req);

  const segment = {
    channel: ctx.salesChannel,
    ...DEFAULT_SEGMENT,
    ...ctx.defaultSegment,
    ...segmentFromCookie,
    ...segmentFromRequest,
  };
  const token = serialize(segment);
  setSegmentInBag(ctx, { payload: segment, token });

  // Avoid setting cookie when segment from request matches the one generated
  if (vtex_segment !== token) {
    setCookie(ctx.response.headers, {
      value: token,
      name: SEGMENT_COOKIE_NAME,
      path: "/",
      secure: true,
      httpOnly: true,
    });
  }
};
