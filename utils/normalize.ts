export const removeScriptChars = (str: string): string => {
  const removedPlus = str.replace(/\+/g, "").replaceAll(" ", "");
  const removedBrackets = removedPlus.replace(/[\[\]{}()<>]/g, "");
  const normalized = removedBrackets.normalize("NFD").replace(
    /[\u0300-\u036f]/g,
    "",
  );
  return normalized;
};

export const removeNonLatin1Chars = (str: string): string => {
  // deno-lint-ignore no-control-regex
  const latin1Regex = /[^\x00-\x7F]|[\"\']/g;
  return str.replace(latin1Regex, "");
};

export const removeNonAscChars = (str: string): string => {
  // deno-lint-ignore no-control-regex
  const latin1Regex = /[^\x00-\x7F]|[\"\']/g;
  return str.replace(latin1Regex, "");
};

export const removeDirtyCookies = (headers?: Headers) => {
  if (!headers) {
    return;
  }
  const existingCookie = removeNonAscChars(headers.get("cookie") || "");
  // remove only brackets
  const removedBrackets = existingCookie?.replace(/[\[\]]/g, "").normalize(
    "NFD",
  ).replace(
    /[\u0300-\u036f]/g,
    "",
  );
  headers.set("cookie", `${removedBrackets}`);
  return headers;
};
