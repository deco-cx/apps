import {
  fetchAPI as _fetchAPI,
  fetchSafe as _fetchSafe,
} from "../../utils/fetch.ts";

type CachingMode = "stale-while-revalidate";

type DecoInit = {
  cache: CachingMode;
  cacheTtlByStatus?: Array<{ from: number; to: number; ttl: number }>;
};

export type DecoRequestInit = RequestInit & { deco?: DecoInit };

export const fetchSafe = (
  input: string | Request | URL,
  init?: DecoRequestInit,
) => {
  return _fetchSafe(input, init);
};

export const fetchAPI = <T>(
  input: string | Request | URL,
  init?: DecoRequestInit,
): Promise<T> => {
  return _fetchAPI(input, init);
};
