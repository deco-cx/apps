import {
  fetchAPI as _fetchAPI,
  fetchSafe as _fetchSafe,
} from "../../utils/fetch.ts";
import {
  removeNonLatin1Chars,
  removeScriptChars,
} from "../../utils/normalize.ts";

type CachingMode = "stale-while-revalidate";

type DecoInit = {
  cache: CachingMode;
  cacheTtlByStatus?: Array<{ from: number; to: number; ttl: number }>;
};

export type DecoRequestInit = RequestInit & { deco?: DecoInit };

const getSanitizedInput = (
  input: string | Request | URL,
) => {
  let url: URL;

  if (typeof input === "string") {
    url = new URL(input);
  } else if (input instanceof URL) {
    url = input;
  } else {
    return input;
  }

  const QS_TO_REMOVE_PLUS = ["utm_campaign", "utm_medium", "utm_source", "map"];

  QS_TO_REMOVE_PLUS.forEach((qsToSanatize) => {
    if (url.searchParams.has(qsToSanatize)) {
      const searchParams = url.searchParams;
      const testParamValues = searchParams.getAll(qsToSanatize);
      const updatedTestParamValues = testParamValues.map((str) =>
        removeScriptChars(removeNonLatin1Chars(str))
      );
      searchParams.delete(qsToSanatize);
      updatedTestParamValues.forEach((updatedValue) =>
        updatedValue && searchParams.append(qsToSanatize, updatedValue)
      );
    }
  });

  const QS_TO_REPLACE_PLUS = ["ft"];
  QS_TO_REPLACE_PLUS.forEach((qsToSanatize) => {
    if (url.searchParams.has(qsToSanatize)) {
      const searchParams = url.searchParams;
      const testParamValues = searchParams.getAll(qsToSanatize);
      const updatedTestParamValues = testParamValues.map((paramValue) =>
        encodeURIComponent(paramValue.trim())
      );
      searchParams.delete(qsToSanatize);
      updatedTestParamValues.forEach((updatedValue) =>
        searchParams.append(qsToSanatize, updatedValue)
      );
    }
  });

  return url.toString();
};

export const fetchSafe = (
  input: string | Request | URL,
  init?: DecoRequestInit,
) => {
  return _fetchSafe(getSanitizedInput(input), init);
};

export const fetchAPI = <T>(
  input: string | Request | URL,
  init?: DecoRequestInit,
): Promise<T> => {
  return _fetchAPI(getSanitizedInput(input), init);
};
