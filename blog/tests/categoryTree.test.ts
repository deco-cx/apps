import { assertEquals } from "@std/assert";
import {
  ancestorsOf,
  categoryPathname,
  childrenOf,
  descendantSlugs,
  indexCategories,
  MAX_CATEGORY_DEPTH,
  withCategoryPath,
} from "../core/categoryTree.ts";
import { Category } from "../types.ts";

/**
 * Categories come from a decofile a human types into, so every walk over
 * `parentSlug` has to survive garbage: a slug pointing at nothing, at itself,
 * or around a cycle. None of these may hang a request.
 */
const cat = (slug: string, parentSlug?: string): Category => ({
  name: slug.toUpperCase(),
  slug,
  ...(parentSlug ? { parentSlug } : {}),
});

const slugsOf = (chain: Category[] | null) => chain?.map((c) => c.slug) ?? null;

Deno.test("ancestorsOf returns the chain root first", () => {
  const categories = [cat("root"), cat("mid", "root"), cat("leaf", "mid")];
  const chain = ancestorsOf("leaf", indexCategories(categories));

  assertEquals(slugsOf(chain), ["root", "mid", "leaf"]);
  assertEquals(categoryPathname(chain!), "root/mid/leaf");
});

Deno.test("ancestorsOf returns null for an unknown slug", () => {
  assertEquals(ancestorsOf("ghost", indexCategories([cat("root")])), null);
});

Deno.test("a cycle yields no chain instead of looping", () => {
  const categories = [cat("a", "b"), cat("b", "a")];
  // Walking up from `a` reaches `b`, whose parent is `a` again. The visited set
  // stops the walk; the chain is reported as unusable rather than truncated,
  // because a truncated one would name a canonical URL missing its top.
  assertEquals(ancestorsOf("a", indexCategories(categories)), null);
});

Deno.test("a self-referencing category is treated as a root", () => {
  assertEquals(slugsOf(ancestorsOf("a", indexCategories([cat("a", "a")]))), [
    "a",
  ]);
});

Deno.test("a dangling parentSlug stops the walk", () => {
  const categories = [cat("leaf", "does-not-exist")];
  assertEquals(slugsOf(ancestorsOf("leaf", indexCategories(categories))), [
    "leaf",
  ]);
});

Deno.test("a chain deeper than MAX_CATEGORY_DEPTH is rejected", () => {
  const chainOf = (length: number) =>
    Array.from(
      { length },
      (_, i) => cat(`c${i}`, i === 0 ? undefined : `c${i - 1}`),
    );

  const deepest = chainOf(MAX_CATEGORY_DEPTH);
  assertEquals(
    ancestorsOf(`c${MAX_CATEGORY_DEPTH - 1}`, indexCategories(deepest))?.length,
    MAX_CATEGORY_DEPTH,
  );

  // One level past the ceiling: reporting the truncated chain would hand the
  // canonical URL a path missing its topmost segments, so it reports nothing.
  const tooDeep = chainOf(MAX_CATEGORY_DEPTH + 1);
  assertEquals(
    ancestorsOf(`c${MAX_CATEGORY_DEPTH}`, indexCategories(tooDeep)),
    null,
  );
});

Deno.test("duplicated slugs resolve to the first record", () => {
  const first: Category = { name: "First", slug: "dup" };
  const second: Category = { name: "Second", slug: "dup", parentSlug: "dup" };
  const index = indexCategories([first, second]);

  assertEquals(index.get("dup")?.name, "First");
  assertEquals(index.size, 1);
});

Deno.test("descendantSlugs collects the whole subtree, itself included", () => {
  const categories = [
    cat("root"),
    cat("a", "root"),
    cat("b", "root"),
    cat("a1", "a"),
    cat("other"),
  ];
  const slugs = descendantSlugs("root", categories).sort();

  assertEquals(slugs, ["a", "a1", "b", "root"]);
});

Deno.test("descendantSlugs over a cycle stays finite", () => {
  const categories = [cat("a", "b"), cat("b", "a")];
  assertEquals(descendantSlugs("a", categories).sort(), ["a", "b"]);
});

Deno.test("descendantSlugs of an unknown slug is just the slug", () => {
  assertEquals(descendantSlugs("ghost", [cat("root")]), ["ghost"]);
});

Deno.test("childrenOf returns direct children, name sorted", () => {
  const categories = [
    cat("root"),
    cat("zeta", "root"),
    cat("alpha", "root"),
    cat("deep", "alpha"),
  ];
  assertEquals(childrenOf("root", categories).map((c) => c.slug), [
    "alpha",
    "zeta",
  ]);
});

Deno.test("withCategoryPath rewrites the requested path with the real chain", () => {
  const chain = [cat("root"), cat("leaf", "root")];

  // A request that reached the child through a flat path still gets the one
  // canonical URL, so Google consolidates instead of seeing duplicates.
  assertEquals(
    withCategoryPath("https://x.com/blog/leaf?page=2", chain, {
      requested: ["leaf"],
    }),
    "https://x.com/blog/root/leaf",
  );
  assertEquals(
    withCategoryPath("https://x.com/blog/wrong/leaf", chain, {
      requested: ["wrong", "leaf"],
    }),
    "https://x.com/blog/root/leaf",
  );
});

Deno.test("withCategoryPath declines when the slug isn't in the path", () => {
  const chain = [cat("root"), cat("leaf", "root")];

  // A listing hardcoded to a category on a plain /blog route: the pathname has
  // no category segment, so rewriting it would strip the route prefix and
  // point the canonical at a page that doesn't exist.
  assertEquals(
    withCategoryPath("https://x.com/blog", chain, { requested: ["leaf"] }),
    null,
  );
  assertEquals(
    withCategoryPath("https://x.com/blog/other", chain, {
      requested: ["leaf"],
    }),
    null,
  );
  assertEquals(withCategoryPath("https://x.com/blog/leaf", chain, {}), null);
});

Deno.test("withCategoryPath keeps a trailing post slug", () => {
  const chain = [cat("root"), cat("leaf", "root")];
  const knownSlugs = new Set(["root", "leaf"]);

  assertEquals(
    withCategoryPath("https://x.com/blog/leaf/my-post", chain, {
      knownSlugs,
      trailing: "my-post",
    }),
    "https://x.com/blog/root/leaf/my-post",
  );
  // A post route with no category segment keeps its own URL: injecting the
  // chain would canonicalize to a path the site never serves.
  assertEquals(
    withCategoryPath("https://x.com/blog/my-post", chain, {
      knownSlugs,
      trailing: "my-post",
    }),
    null,
  );
  // The categories collection failed to load, so nothing is a known slug —
  // same outcome, rather than doubling the segment already in the path.
  assertEquals(
    withCategoryPath("https://x.com/blog/leaf/my-post", chain, {
      knownSlugs: new Set<string>(),
      trailing: "my-post",
    }),
    null,
  );
});

Deno.test("withCategoryPath with an empty chain rewrites nothing", () => {
  assertEquals(
    withCategoryPath("https://x.com/blog/leaf?page=2", [], {
      requested: ["leaf"],
    }),
    null,
  );
});
