import { assertEquals } from "@std/assert";
import { filterRoutablePosts, isDraftPost } from "../core/handlePosts.ts";
import { BlogPost } from "../types.ts";

const post = (slug: string, status?: string): BlogPost => ({
  title: slug,
  excerpt: "",
  date: "2026-01-01",
  slug,
  // Records come from the CMS, so a site may well have written a string that
  // isn't in the union. Cast so the test can exercise exactly that.
  status: status as BlogPost["status"],
});

Deno.test("absent status is published", () => {
  const posts = [post("no-status")];
  assertEquals(isDraftPost(posts[0]), false);
  assertEquals(filterRoutablePosts(posts).map(({ slug }) => slug), [
    "no-status",
  ]);
});

Deno.test('"published" is published', () => {
  assertEquals(
    filterRoutablePosts([post("live", "published")]).map(({ slug }) => slug),
    ["live"],
  );
});

Deno.test('"draft" is dropped from lists', () => {
  const posts = [post("live", "published"), post("wip", "draft")];
  assertEquals(isDraftPost(posts[1]), true);
  assertEquals(filterRoutablePosts(posts).map(({ slug }) => slug), ["live"]);
});

Deno.test("an unexpected status is published, not silently hidden", () => {
  const posts = [post("archived-by-site", "archived")];
  assertEquals(isDraftPost(posts[0]), false);
  assertEquals(filterRoutablePosts(posts).map(({ slug }) => slug), [
    "archived-by-site",
  ]);
});

Deno.test("unroutable posts are still dropped alongside drafts", () => {
  const posts = [
    post("live"),
    post("   "),
    post("wip", "draft"),
  ];
  assertEquals(filterRoutablePosts(posts).map(({ slug }) => slug), ["live"]);
});
