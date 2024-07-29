import { Page } from "../sections/Analytics/SmarthintTracking.tsx";

const NON_STATIC_PATHS_PATTERNS = ["*", ":", "?"];

export function calculateURLPatternSpecificity(pathname: string): number {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  const specificity = segments.reduce((acc, segment) => {
    // Static segments are more specific
    if (
      NON_STATIC_PATHS_PATTERNS.every((pattern) => !segment.includes(pattern))
    ) return acc += 2;

    // Optional segments are considered less specific
    if (segment.includes("*") || segment.includes("?")) {
      return acc -= 0.5;
    }

    return acc += 1;
  }, 0);

  return specificity;
}

export const sortPagesPattern = (pages: Page[]) => {
  return pages.sort((a, b) => {
    const URLPatternSpecificityA = calculateURLPatternSpecificity(a.page);
    const URLPatternSpecificityB = calculateURLPatternSpecificity(b.page);
    return URLPatternSpecificityB - URLPatternSpecificityA;
  });
};
