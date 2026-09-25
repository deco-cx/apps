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

Deno.test("a cycle truncates the chain instead of looping", () => {
  const categories = [cat("a", "b"), cat("b", "a")];
  // Walking up from `a` reaches `b`, whose parent is `a` again — the visited
  // set stops there rather than recursing forever.
  assertEquals(slugsOf(ancestorsOf("a", indexCategories(categories))), [
    "b",
    "a",
  ]);
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

Deno.test("an over-deep chain is cut at MAX_CATEGORY_DEPTH", () => {
  const categories = Array.from(
    { length: 15 },
    (_, i) => cat(`c${i}`, i === 0 ? undefined : `c${i - 1}`),
  );
  const chain = ancestorsOf("c14", indexCategories(categories));

  assertEquals(chain?.length, MAX_CATEGORY_DEPTH);
  // The cut happens at the far end of the walk, so the category itself is
  // always the last item — the breadcrumb never loses the page it describes.
  assertEquals(chain?.[chain.length - 1].slug, "c14");
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
    withCategoryPath("https://x.com/blog/leaf?page=2", chain, { strip: 1 }),
    "https://x.com/blog/root/leaf",
  );
  assertEquals(
    withCategoryPath("https://x.com/blog/wrong/leaf", chain, { strip: 2 }),
    "https://x.com/blog/root/leaf",
  );
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
  assertEquals(
    withCategoryPath("https://x.com/blog/my-post", chain, {
      knownSlugs,
      trailing: "my-post",
    }),
    "https://x.com/blog/root/leaf/my-post",
  );
});

Deno.test("withCategoryPath with an empty chain leaves the path alone", () => {
  assertEquals(
    withCategoryPath("https://x.com/blog/leaf?page=2", []),
    "https://x.com/blog/leaf",
  );
});
