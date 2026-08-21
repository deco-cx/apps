import { assertEquals } from "@std/assert";
import { filterRoutablePosts } from "../core/handlePosts.ts";
import { BlogPost, isPublishedStatus } from "../types.ts";

const post = (
  slug: string,
  status?: string,
  scheduledDatetime?: string,
): BlogPost => ({
  title: slug,
  excerpt: "",
  date: "2026-01-01",
  slug,
  // Records come from the CMS, so a site may well have written a string that
  // isn't in the union. Cast so the tests can exercise exactly that.
  status: status as BlogPost["status"],
  scheduledDatetime,
});

const DAY = 86_400_000;

/**
 * Scheduling is compared against the wall clock, so the fixtures are relative
 * to it: a literal date would silently flip from future to past as time passes.
 */
const fromNow = (offsetMs: number) =>
  new Date(Date.now() + offsetMs).toISOString();

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

Deno.test("a scheduled post is listed once its instant has passed", () => {
  assertEquals(
    listed([post("due", "scheduled", fromNow(-DAY))]),
    ["due"],
  );
});

Deno.test("a scheduled post is hidden until its instant arrives", () => {
  assertEquals(listed([post("soon", "scheduled", fromNow(DAY))]), []);
});

Deno.test("a scheduled post with no instant is hidden", () => {
  // Fail closed: the CMS said "scheduled" and never said when, so the post has
  // no go-live to have passed.
  assertEquals(listed([post("undated", "scheduled")]), []);
  assertEquals(listed([post("blank-date", "scheduled", "")]), []);
});

Deno.test("a scheduled post with an unparseable instant is hidden", () => {
  // The parse collapses to 0, which compares as 1970 — i.e. as *already live*.
  // Rejecting it is what keeps a typo from publishing a post early.
  // Not exhaustive by design: `Date` is a lenient parser, so some junk ("0"
  // becomes the year 2000) does resolve to a real instant and is honoured.
  for (const garbage of ["not a date", "tomorrow", "2026-13-45"]) {
    assertEquals(listed([post("junk", "scheduled", garbage)]), [], garbage);
  }
});

Deno.test("scheduledDatetime is inert unless the status is scheduled", () => {
  // A post switched back to `published` keeps its old schedule field; that must
  // not un-publish it. And a draft's schedule must not publish it either.
  assertEquals(
    listed([post("live", "published", fromNow(DAY))]),
    ["live"],
  );
  assertEquals(listed([post("wip", "draft", fromNow(-DAY))]), []);
});

Deno.test("an offset-less instant is read as UTC, not as server local time", () => {
  // Two hours ago in UTC, written without a designator. Parsed as *local* time
  // this lands in the future for any negative-offset server (e.g. UTC-3), so
  // the post would stay hidden there and be listed in UTC — the same record
  // going live at different moments depending on which machine served it.
  const twoHoursAgo = fromNow(-2 * 60 * 60 * 1000).replace("Z", "");

  assertEquals(listed([post("due", "scheduled", twoHoursAgo)]), ["due"]);
});
