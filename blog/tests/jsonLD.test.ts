import { assertEquals } from "@std/assert";
import { BlogPost } from "../types.ts";
import { toISODateTime } from "../utils/date.ts";
import { toBlogPosting } from "../utils/jsonLD.ts";

const post = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  title: "How to brew",
  slug: "how-to-brew",
  date: "2024-06-01",
  excerpt: "A guide",
  ...overrides,
});

Deno.test("toISODateTime places a bare date at 08:00 UTC", () => {
  assertEquals(toISODateTime("2025-06-01"), "2025-06-01T08:00:00.000Z");
});

Deno.test("toISODateTime pins an offset-less date-time to UTC", () => {
  assertEquals(
    toISODateTime("2025-06-01T00:00:00"),
    "2025-06-01T00:00:00.000Z",
  );
});

Deno.test("toISODateTime keeps the instant of an offset date-time", () => {
  assertEquals(
    toISODateTime("2025-06-01T09:00:00+02:00"),
    "2025-06-01T07:00:00.000Z",
  );
});

Deno.test("toISODateTime keeps the Unix epoch", () => {
  assertEquals(
    toISODateTime("1970-01-01T00:00:00Z"),
    "1970-01-01T00:00:00.000Z",
  );
});

Deno.test("toISODateTime returns undefined for an unparseable value", () => {
  assertEquals(toISODateTime(""), undefined);
  assertEquals(toISODateTime("not a date"), undefined);
});

Deno.test("toISODateTime rejects an impossible calendar date", () => {
  assertEquals(toISODateTime("2024-02-31"), undefined);
  assertEquals(toISODateTime("2024-02-31T10:00:00Z"), undefined);
});

Deno.test("toISODateTime rejects non-ISO strings", () => {
  assertEquals(toISODateTime("June 1, 2025"), undefined);
});

Deno.test("toBlogPosting normalizes full timestamps and bare dates alike", () => {
  assertEquals(
    toBlogPosting(post({ date: "2025-10-31T15:10:01Z" })).datePublished,
    "2025-10-31T15:10:01.000Z",
  );
  assertEquals(
    toBlogPosting(post({ date: "2026-08-14" })).datePublished,
    "2026-08-14T08:00:00.000Z",
  );
});

Deno.test("toBlogPosting emits dates with a timezone", () => {
  const node = toBlogPosting(post({ dateModified: "2024-07-01T10:30:00" }));

  assertEquals(node.datePublished, "2024-06-01T08:00:00.000Z");
  assertEquals(node.dateModified, "2024-07-01T10:30:00.000Z");
});

Deno.test("toBlogPosting drops dates that can't be parsed", () => {
  const node = toBlogPosting(
    post({ date: "not a date", dateModified: "soon" }),
  );

  assertEquals("datePublished" in node, false);
  assertEquals("dateModified" in node, false);
});
