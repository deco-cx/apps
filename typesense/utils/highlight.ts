// deno-lint-ignore-file no-explicit-any

type HighlightObject = {
  matched_tokens?: string[];
  snippet?: string;
  value?: string;
};

type Highlight<T> = T extends string | number ? HighlightObject
  : {
    [TAttribute in keyof T]?: Highlight<T[TAttribute]>;
  };

const isHighlightObject = (x: any): x is HighlightObject =>
  Array.isArray(x?.matched_tokens);

export const replaceHighlight = <T extends object>(
  obj: T,
  highlights: Highlight<T> | undefined,
) => {
  const deref: any = obj;

  for (const [key, value] of Object.entries(highlights ?? {})) {
    if (isHighlightObject(value)) {
      const { snippet } = value;

      if (typeof deref[key] === "string" && typeof snippet === "string") {
        deref[key] = snippet;
      }
    } else {
      replaceHighlight(deref[key], value as any);
    }
  }

  return obj;
};
