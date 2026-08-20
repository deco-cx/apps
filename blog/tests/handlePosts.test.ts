import { assertEquals } from "@std/assert";
import { filterRoutablePosts } from "../core/handlePosts.ts";
import { BlogPost, isPublishedStatus } from "../types.ts";

const post = (slug: string, status?: string): BlogPost => ({
  title: slug,
  excerpt: "",
  date: "2026-01-01",
  slug,
  // Records come from the CMS, so a site may well have written a string that
  // isn't in the union. Cast so the tests can exercise exactly that.
  status: status as BlogPost["status"],
});

const listed = (posts: BlogPost[]) =>
  filterRoutablePosts(posts).map(({ slug }) => slug);

Deno.test("absent status is published", () => {
  assertEquals(isPublishedStatus(undefined), true);
  assertEquals(listed([post("no-status")]), ["no-status"]);
});

Deno.test('"published" is published', () => {
  assertEquals(isPublishedStatus("published"), true);
  assertEquals(listed([post("live", "published")]), ["live"]);
});

Deno.test("every non-published status is dropped from lists", () => {
  for (const status of ["draft", "archived", "generating", "awaiting_review"]) {
    assertEquals(isPublishedStatus(status), false, status);
    assertEquals(
      listed([post("live"), post(status, status)]),
      ["live"],
      status,
    );
  }
});

Deno.test("an unrecognized status is treated as not ready, so it is dropped", () => {
  // The vocabulary is an allowlist: a status this app doesn't know is a state
  // the CMS added, and shipping a half-written post is worse than hiding one.
  assertEquals(isPublishedStatus("some_future_state"), false);
  assertEquals(listed([post("unknown", "some_future_state")]), []);
});

Deno.test("an empty status is published, not hidden", () => {
  // Distinct from the case above: "" is what an unset CMS field serializes to,
  // so it has to behave like absent or those posts vanish on upgrade.
  assertEquals(isPublishedStatus(""), true);
  assertEquals(listed([post("blank", "")]), ["blank"]);
});

Deno.test("unroutable posts are still dropped alongside unpublished ones", () => {
  assertEquals(listed([post("live"), post("   "), post("wip", "draft")]), [
    "live",
  ]);
});
