import { getCookies } from "std/http/mod.ts";

export interface Segment {
  campaigns?: string | number | null;
  channel?: string | number | null;
  priceTables?: string | number | null;
  regionId?: string | number | null;
  utm_campaign?: string | number | null;
  utm_source?: string | number | null;
  utmi_campaign?: string | number | null;
  currencyCode?: string | number | null;
  currencySymbol?: string | number | null;
  countryCode?: string | number | null;
  cultureInfo?: string | number | null;
  channelPrivacy?: string | number | null;
}

function loader(_: unknown, req: Request): Segment | null {
  return base(req);
}

function base(req: Request): Segment | null {
  let segmentObject = {
    campaigns: null,
    channel: null,
    priceTables: null,
    regionId: null,
    utm_campaign: null,
    utm_source: null,
    utmi_campaign: null,
    currencyCode: null,
    currencySymbol: null,
    countryCode: null,
    cultureInfo: null,
    channelPrivacy: null,
  };
  const segmentString = getCookies(req.headers)["vtex_segment"];
  if (segmentString) {
    segmentObject = Object.assign(
      segmentObject,
      JSON.parse(atob(segmentString)),
    );
  }
  return segmentObject;
}

export default loader;
