import { Category } from "../types.ts";

/**
 * Categories come from a decofile a human edits by hand, so `parentSlug` can
 * point at nothing, at itself, or back into a cycle. Every walk below is
 * bounded twice — by a visited set and by this ceiling — so a malformed record
 * can never hang a request.
 */
export const MAX_CATEGORY_DEPTH = 4;

const isValid = (c?: Category | null): c is Category =>
  !!c && typeof c.slug === "string" && c.slug.length > 0 &&
  typeof c.name === "string" && c.name.length > 0;

/** Slug -> category. First entry wins when a slug is duplicated. */
export const indexCategories = (
  categories: Category[] | null | undefined,
): Map<string, Category> => {
  const index = new Map<string, Category>();
  for (const category of categories ?? []) {
    if (isValid(category) && !index.has(category.slug)) {
      index.set(category.slug, category);
    }
  }
  return index;
};

const parentOf = (
  category: Category,
  index: Map<string, Category>,
): Category | undefined => {
  const parentSlug = category.parentSlug;
  if (
    typeof parentSlug !== "string" || !parentSlug ||
    parentSlug === category.slug
  ) {
    return undefined;
  }
  return index.get(parentSlug);
};

/**
 * The ancestor chain of `slug`, root first and the category itself last —
 * exactly the breadcrumb sequence. Returns null when the slug is unknown.
 * A dangling `parentSlug`, a self-reference, a cycle or an over-deep chain all
 * stop the walk and yield the truncated chain instead of throwing.
 */
export const ancestorsOf = (
  slug: string,
  index: Map<string, Category>,
): Category[] | null => {
  const start = index.get(slug);
  if (!start) {
    return null;
  }

  const chain: Category[] = [];
  const seen = new Set<string>();
  let current: Category | undefined = start;

  while (
    current && !seen.has(current.slug) && chain.length < MAX_CATEGORY_DEPTH
  ) {
    seen.add(current.slug);
    chain.push(current);
    current = parentOf(current, index);
  }

  return chain.reverse();
};

/** Children indexed by parent slug, skipping self-references. */
const childrenIndex = (categories: Category[]): Map<string, Category[]> => {
  const children = new Map<string, Category[]>();
  for (const category of categories) {
    const parentSlug = category.parentSlug;
    if (
      !isValid(category) || typeof parentSlug !== "string" || !parentSlug ||
      parentSlug === category.slug
    ) {
      continue;
    }
    const siblings = children.get(parentSlug);
    siblings ? siblings.push(category) : children.set(parentSlug, [category]);
  }
  return children;
};

/**
 * `slug` plus every category below it. Breadth-first with a visited set, so a
 * cycle yields a finite set instead of looping. Used to make a parent category
 * list its children's posts.
 */
export const descendantSlugs = (
  slug: string,
  categories: Category[] | null | undefined,
): string[] => {
  const children = childrenIndex(categories ?? []);
  const seen = new Set<string>([slug]);
  let frontier = [slug];

  for (let depth = 0; depth < MAX_CATEGORY_DEPTH && frontier.length; depth++) {
    const next: string[] = [];
    for (const parent of frontier) {
      for (const child of children.get(parent) ?? []) {
        if (!seen.has(child.slug)) {
          seen.add(child.slug);
          next.push(child.slug);
        }
      }
    }
    frontier = next;
  }

  return [...seen];
};

/** Direct children of `slug`, name-sorted. */
export const childrenOf = (
  slug: string,
  categories: Category[] | null | undefined,
): Category[] =>
  (childrenIndex(categories ?? []).get(slug) ?? [])
    .sort((a, b) => a.name.localeCompare(b.name));

/** "pai/filho" — the URL path a category chain occupies. */
export const categoryPathname = (chain: Category[]): string =>
  chain.map((c) => c.slug).join("/");

interface PathOptions {
  /** How many trailing segments of the request are the category path. */
  strip?: number;
  /** Known category slugs, used to find the category segments when `strip` is unknown. */
  knownSlugs?: Set<string>;
  /** Segment that stays at the end of the path — a post slug. */
  trailing?: string;
}

/**
 * Rewrites the category portion of a URL with the canonical chain, keeping the
 * route prefix (`/blog`) and an optional trailing post slug. A request that
 * reaches a child through a stale or wrong path still renders; this is what
 * points its canonical at the one true URL so Google consolidates instead of
 * seeing duplicates.
 */
export const withCategoryPath = (
  url: string | URL,
  chain: Category[],
  { strip, knownSlugs, trailing }: PathOptions = {},
): string => {
  const parsed = new URL(url);
  if (chain.length === 0) {
    return new URL(parsed.pathname, parsed.origin).href;
  }

  let segments = parsed.pathname.split("/").filter(Boolean);

  if (trailing && segments[segments.length - 1] === trailing) {
    segments = segments.slice(0, -1);
  }

  if (typeof strip === "number") {
    segments = strip > 0
      ? segments.slice(0, Math.max(segments.length - strip, 0))
      : segments;
  } else if (knownSlugs) {
    while (segments.length && knownSlugs.has(segments[segments.length - 1])) {
      segments = segments.slice(0, -1);
    }
  }

  const pathname = "/" + [
    ...segments,
    ...chain.map((c) => c.slug),
    ...(trailing ? [trailing] : []),
  ].join("/");

  return new URL(pathname, parsed.origin).href;
};
