import { assertEquals } from "@std/assert";
import handlePosts, { filterRoutablePosts } from "../core/handlePosts.ts";
import BlogpostList from "../loaders/BlogpostList.ts";
import BlogpostListing from "../loaders/BlogpostListing.ts";
import BlogRelatedPosts from "../loaders/BlogRelatedPosts.ts";
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { isDraftPreview } from "../utils/draftPreview.ts";

const COLLECTION_PATH = "collections/blog/posts";
const HOUR = 3_600_000;

const post = (
  slug: string,
  date: string,
  extra: Partial<BlogPost> = {},
): BlogPost => ({ title: slug, excerpt: "", date, slug, ...extra });

const mixed: BlogPost[] = [
  post("live-1", "2024-05-01"),
  post("draft-1", "2024-04-01", { status: "draft" }),
  post("future-1", "2024-03-01", {
    status: "scheduled",
    scheduledDatetime: new Date(Date.now() + HOUR).toISOString(),
  }),
  post("archived-1", "2024-02-01", { status: "archived" }),
];
const all = ["live-1", "draft-1", "future-1", "archived-1"];

/**
 * The loaders read records through `getRecordsByPath`, which resolves
 * `{ __resolveType: "resolvables" }` off the context. Stubbing `ctx.get` is
 * enough to drive them without a live deco runtime.
 */
const ctx = {
  get: () =>
    Promise.resolve(
      Object.fromEntries(
        mixed.map((p) => [
          `${COLLECTION_PATH}/${p.slug}`,
          { name: `${COLLECTION_PATH}/${p.slug}`, post: p },
        ]),
      ),
    ),
} as unknown as AppContext;

const req = (query = "draft=true") =>
  new Request(`https://example.com/blog?${query}`);
const slugs = (posts?: BlogPost[] | null) => posts?.map(({ slug }) => slug);

Deno.test("only the literal `true` turns the preview on", () => {
  assertEquals(isDraftPreview(new URL(req().url)), true);
  for (const query of ["", "draft=1", "draft=false", "draft", "__draft=true"]) {
    assertEquals(isDraftPreview(new URL(req(query).url)), false, query);
  }
});

Deno.test("filterRoutablePosts keeps non-live posts but still drops slugless ones", () => {
  const posts = [...mixed, post("", "2024-01-01", { status: "draft" })];
  assertEquals(slugs(filterRoutablePosts(posts, true)), all);
  assertEquals(slugs(filterRoutablePosts(posts)), ["live-1"]);
});

Deno.test("handlePosts includes drafts only when asked", async () => {
  assertEquals(slugs(await handlePosts(mixed, "date_desc", ctx)), ["live-1"]);
  assertEquals(
    slugs(
      await handlePosts(
        mixed,
        "date_desc",
        ctx,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      ),
    ),
    all,
  );
});

Deno.test("BlogpostListing in preview lists every post, unindexed, and pages keep the flag", async () => {
  const result = await BlogpostListing({ count: 2 }, req(), ctx);

  assertEquals(slugs(result?.posts), ["live-1", "draft-1"]);
  assertEquals(result?.pageInfo.records, 4);
  assertEquals(result?.pageInfo.nextPage?.includes("draft=true"), true);
  assertEquals(result?.seo.noIndexing, true);
});

Deno.test("BlogpostListing without the flag stays live-only and indexable", async () => {
  const result = await BlogpostListing({}, req(""), ctx);

  assertEquals(slugs(result?.posts), ["live-1"]);
  assertEquals("noIndexing" in (result?.seo ?? {}), false);
});

Deno.test("BlogpostList includes drafts in preview", async () => {
  assertEquals(slugs(await BlogpostList({}, req(), ctx)), all);
  assertEquals(slugs(await BlogpostList({}, req(""), ctx)), ["live-1"]);
});

Deno.test("BlogRelatedPosts includes drafts in preview", async () => {
  const result = await BlogRelatedPosts(
    { excludePostSlug: "live-1" },
    req(),
    ctx,
  );
  assertEquals(slugs(result), ["draft-1", "future-1", "archived-1"]);
});
