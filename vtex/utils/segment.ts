import { getCookies, setCookie } from "std/http/mod.ts";
import type { Segment } from "./types.ts";
import { AppContext } from "../mod.ts";

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

export const getSegment = (ctx: AppContext): Partial<Segment> =>
  ctx.bag?.get(SEGMENT);
export const setSegment = (ctx: AppContext, segment: Partial<Segment>) =>
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

export const getSegmentCookie = (req: Request): Partial<Segment> => {
  const url = new URL(req.url);
  const cookies = getCookies(req.headers);
  const cookie = cookies[SEGMENT_COOKIE_NAME];
  const partial = cookie && parse(cookie);

  return {
    ...partial,
    utmi_campaign: url.searchParams.get("utmi_campaign") ?? null,
    utm_campaign: url.searchParams.get("utm_campaign") ?? null,
    utm_source: url.searchParams.get("utm_source") ?? null,
  };
};

export const setSegmentCookie = (
  segment: Partial<Segment>,
  headers: Headers = new Headers(),
): Headers => {
  setCookie(headers, {
    value: serialize(segment),
    name: SEGMENT_COOKIE_NAME,
    path: "/",
    secure: true,
    httpOnly: true,
  });

  return headers;
};

export const withSegmentCookie = (
  segment: Partial<Segment>,
  headers?: Headers,
) => {
  const h = new Headers(headers);

  h.set("cookie", `${SEGMENT_COOKIE_NAME}=${serialize(segment)}`);

  return h;
};
