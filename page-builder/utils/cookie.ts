import { getCookies, setCookie } from "std/http/mod.ts";

export const SEGMENT_COOKIE_NAME = "page-builder_segment";

export const getSegmentFromCookie = (
    req: Request,
  ): string | undefined => {
    const cookies = getCookies(req.headers);
    const cookie = cookies[SEGMENT_COOKIE_NAME];
    return cookie;
  };
  
  export const setSegmentCookie = (
    segment: string,
    headers: Headers = new Headers(),
  ): Headers => {
    setCookie(headers, {
      value: segment,
      name: SEGMENT_COOKIE_NAME,
      path: "/",
      secure: true,
      httpOnly: true
    });
  
    return headers;
  };