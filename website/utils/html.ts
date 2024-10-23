export const stripHTML = (str: string) =>
  str.replace(
    /(<([^>]+)>)/gi,
    "",
  );
