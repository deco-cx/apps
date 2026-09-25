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
 * exactly the breadcrumb sequence.
 *
 * Returns null whenever the chain cannot be trusted: the slug is unknown, the
 * walk ran into a cycle, or it went past MAX_CATEGORY_DEPTH. A truncated chain
 * is worse than none — it would name a breadcrumb and a canonical URL missing
 * their topmost segments — so callers fall back to the flat behaviour instead.
 * A dangling `parentSlug` or a self-reference is not an error: the walk just
 * ends there, treating the category as a root.
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

  while (current) {
    if (seen.has(current.slug) || chain.length >= MAX_CATEGORY_DEPTH) {
      return null;
    }
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
  /**
   * The category segments the router handed the loader. They must be the tail
   * of the pathname, otherwise the slug was configured by hand and the URL
   * carries no category to rewrite.
   */
  requested?: string[];
  /**
   * Known category slugs, for routes that don't hand the category over — the
   * category segments are the trailing ones that name a real category.
   */
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
 *
 * Returns null when the URL has no category portion to replace — a route
 * without a category segment, or a slug that didn't come from the route. The
 * caller keeps the request URL rather than inventing a path that 404s.
 */
export const withCategoryPath = (
  url: string | URL,
  chain: Category[],
  { requested, knownSlugs, trailing }: PathOptions = {},
): string | null => {
  if (chain.length === 0) {
    return null;
  }

  const parsed = new URL(url);
  let segments = parsed.pathname.split("/").filter(Boolean);

  if (trailing) {
    if (segments[segments.length - 1] !== trailing) {
      return null;
    }
    segments = segments.slice(0, -1);
  }

  if (requested) {
    const size = requested.length;
    const tail = segments.slice(Math.max(segments.length - size, 0));
    if (size === 0 || tail.join("/") !== requested.join("/")) {
      return null;
    }
    segments = segments.slice(0, segments.length - size);
  } else if (knownSlugs) {
    const before = segments.length;
    while (segments.length && knownSlugs.has(segments[segments.length - 1])) {
      segments = segments.slice(0, -1);
    }
    if (segments.length === before) {
      return null;
    }
  } else {
    return null;
  }

  const pathname = "/" + [
    ...segments,
    ...chain.map((c) => c.slug),
    ...(trailing ? [trailing] : []),
  ].join("/");

  return new URL(pathname, parsed.origin).href;
};
