import { getCookies, setCookie } from "std/http/mod.ts";
import { AppContext } from "../mod.ts";
import type { Segment } from "./types.ts";

const SEGMENT_COOKIE_NAME = "vtex_segment";
const SEGMENT = Symbol("segment");

export const isAnonymous = ({
  campaigns,
  utm_campaign,
  utm_source,
  utmi_campaign,
  channel,
  priceTables,
  regionId,
}: Partial<Segment>) =>
  !campaigns &&
  !utm_campaign &&
  !utm_source &&
  !utmi_campaign &&
  !channel &&
  !priceTables &&
  !regionId;

export const getSegmentFromBag = (ctx: AppContext): Partial<Segment> =>
  ctx.bag?.get(SEGMENT);
export const setSegmentInBag = (ctx: AppContext, segment: Partial<Segment>) =>
  ctx.bag?.set(SEGMENT, segment);

/**
 * Stable serialization.
 *
 * This means that even if the attributes are in a different order, the final segment
 * value will be the same. This improves cache hits
 */
export const serialize = ({
  campaigns,
  channel,
  priceTables,
  regionId,
  utm_campaign,
  utm_source,
  utmi_campaign,
  currencyCode,
  currencySymbol,
  countryCode,
  cultureInfo,
  channelPrivacy,
}: Partial<Segment>) =>
  btoa(JSON.stringify({
    campaigns,
    channel,
    priceTables,
    regionId,
    utm_campaign,
    utm_source,
    utmi_campaign,
    currencyCode,
    currencySymbol,
    countryCode,
    cultureInfo,
    channelPrivacy,
  }));

export const parse = (cookie: string) => JSON.parse(atob(cookie));

export const getSegmentFromCookie = (
  req: Request,
): Partial<Segment> | undefined => {
  const cookies = getCookies(req.headers);
  const cookie = cookies[SEGMENT_COOKIE_NAME];
  const segment = cookie && parse(cookie);

  return segment;
};

const SEGMENT_QUERY_PARAMS = [
  "utmi_campaign" as const,
  "utm_campaign" as const,
  "utm_source" as const,
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

export const setSegmentCookie = (
  segment: string | Partial<Segment>,
  headers: Headers = new Headers(),
): [Headers, string] => {
  const value = typeof segment === "string" ? segment : serialize(segment);
  setCookie(headers, {
    value,
    name: SEGMENT_COOKIE_NAME,
    path: "/",
    secure: true,
    httpOnly: true,
  });

  return [headers, value];
};

export const withSegmentCookie = (
  segment: Partial<Segment>,
  headers?: Headers,
) => {
  const h = new Headers(headers);

  h.set("cookie", `${SEGMENT_COOKIE_NAME}=${serialize(segment)}`);

  return h;
};
