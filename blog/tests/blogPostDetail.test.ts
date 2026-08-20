import { assertEquals } from "@std/assert";
import BlogPostItem from "../loaders/BlogPostItem.ts";
import BlogPostPageLoader from "../loaders/BlogPostPage.ts";
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";

const COLLECTION_PATH = "collections/blog/posts";

/**
 * Both loaders read records through `getRecordsByPath`, which resolves
 * `{ __resolveType: "resolvables" }` off the context. Stubbing `ctx.get` is
 * enough to drive them without a live deco runtime.
 */
const ctxWith = (post: Partial<BlogPost>) =>
  ({
    get: () =>
      Promise.resolve({
        [`${COLLECTION_PATH}/${post.slug}`]: {
          name: `${COLLECTION_PATH}/${post.slug}`,
          post,
        },
      }),
  }) as unknown as AppContext;

const draft: Partial<BlogPost> = {
  title: "Work in progress",
  excerpt: "Not out yet",
  date: "2026-01-01",
  slug: "wip",
  status: "draft",
};

const req = new Request("https://example.com/blog/wip");

Deno.test("BlogPostItem still serves a draft, marked noIndexing", async () => {
  const post = await BlogPostItem({ slug: "wip" }, req, ctxWith(draft));

  assertEquals(post?.slug, "wip");
  assertEquals(post?.seo?.noIndexing, true);
});

Deno.test("BlogPostItem keeps the draft's other seo fields", async () => {
  const post = await BlogPostItem(
    { slug: "wip" },
    req,
    ctxWith({
      ...draft,
      seo: { title: "Custom title", canonical: "https://example.com/canon" },
    }),
  );

  assertEquals(post?.seo?.title, "Custom title");
  assertEquals(post?.seo?.canonical, "https://example.com/canon");
  assertEquals(post?.seo?.noIndexing, true);
});

Deno.test("BlogPostItem leaves a published post untouched", async () => {
  const post = await BlogPostItem(
    { slug: "live" },
    req,
    ctxWith({ ...draft, slug: "live", status: "published" }),
  );

  assertEquals(post?.slug, "live");
  assertEquals(post?.seo?.noIndexing, undefined);
});

Deno.test("BlogPostPage still serves a draft, marked noIndexing", async () => {
  const page = await BlogPostPageLoader({ slug: "wip" }, req, ctxWith(draft));

  assertEquals(page?.post.slug, "wip");
  assertEquals(page?.seo?.noIndexing, true);
});

Deno.test("BlogPostPage keeps the draft's other seo fields", async () => {
  const page = await BlogPostPageLoader(
    { slug: "wip" },
    req,
    ctxWith({
      ...draft,
      seo: { title: "Custom title", canonical: "https://example.com/canon" },
    }),
  );

  assertEquals(page?.seo?.title, "Custom title");
  assertEquals(page?.seo?.canonical, "https://example.com/canon");
  assertEquals(page?.seo?.noIndexing, true);
});

Deno.test("BlogPostPage leaves a published post indexable", async () => {
  const page = await BlogPostPageLoader(
    { slug: "live" },
    req,
    ctxWith({ ...draft, slug: "live", status: "published" }),
  );

  assertEquals(page?.seo?.noIndexing, false);
});

Deno.test("every non-published status is served but unindexable", async () => {
  for (
    const status of [
      "draft",
      "archived",
      "generating",
      "awaiting_review",
    ] as const
  ) {
    const ctx = ctxWith({ ...draft, status });

    const item = await BlogPostItem({ slug: "wip" }, req, ctx);
    assertEquals(item?.slug, "wip", status);
    assertEquals(item?.seo?.noIndexing, true, status);

    const page = await BlogPostPageLoader({ slug: "wip" }, req, ctx);
    assertEquals(page?.post.slug, "wip", status);
    assertEquals(page?.seo?.noIndexing, true, status);
  }
});
