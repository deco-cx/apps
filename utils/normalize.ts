export const removeScriptChars = (str: string): string => {
  const removedPlus = str.replace(/\+/g, "").replaceAll(" ", "");
  const normalized = removedPlus.normalize("NFD").replace(
    /[\u0300-\u036f]/g,
    "",
  );
  return normalized;
};

export const removeNonLatin1Chars = (str: string): string => {
  // deno-lint-ignore no-control-regex
  const latin1Regex = /[^\x00-\xFF]/g;
  return str.replace(latin1Regex, "");
};
