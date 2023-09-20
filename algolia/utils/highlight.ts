// deno-lint-ignore-file no-explicit-any

type HighlightObject = {
  readonly value: string;
  readonly matchLevel: "none" | "partial" | "full";
  readonly matchedWords: readonly string[];
  readonly fullyHighlighted?: boolean;
};

type Highlight<THit> = THit extends string | number ? HighlightObject : {
  [KAttribute in keyof THit]?: Highlight<THit[KAttribute]>;
};

const isHighlightObject = (x: any): x is HighlightObject =>
  typeof x?.matchLevel === "string" && typeof x.value === "string" &&
  Array.isArray(x.matchedWords);

export const replaceHighlight = <T extends object>(
  obj: T,
  highlights: Highlight<T> | undefined,
) => {
  const deref: any = obj;

  for (const [key, highlight] of Object.entries(highlights ?? {})) {
    if (isHighlightObject(highlight)) {
      const { value, matchLevel } = highlight;

      if (
        typeof deref[key] === "string" &&
        typeof value === "string" &&
        matchLevel === "full"
      ) {
        deref[key] = value;
      }
    } else {
      replaceHighlight(deref[key], highlight as any);
    }
  }

  return obj;
};
