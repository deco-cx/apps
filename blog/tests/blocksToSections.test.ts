import { assertEquals } from "@std/assert";
import { blocksToSections } from "../utils/blocksToSections.ts";

// deno-lint-ignore no-explicit-any
const faq = (content: Record<string, unknown>): any =>
  blocksToSections([{ type: "faq", content }])[0];

/**
 * FAQ items arrive from the Spire API, so the converter has to survive a
 * payload it did not author: missing fields, wrong types, raw JSON instead of
 * an array. Anything that reaches a block must already be a string, since the
 * sanitizers downstream call `.replace` on it.
 */
Deno.test("faq block converts items given as an array", () => {
  assertEquals(
    faq({ faqId: "f1", items: [{ title: "Q", body: "<p>A</p>" }] }),
    {
      __resolveType: "blog/sections/blocks/FAQ.tsx",
      faqId: "f1",
      items: [{
        title: "Q",
        body: [{
          __resolveType: "blog/sections/blocks/Paragraph.tsx",
          html: "<p>A</p>",
          text: undefined,
          block: true,
        }],
      }],
    },
  );
});

Deno.test("faq block converts items given as a JSON string", () => {
  const items = JSON.stringify([{ title: "Q", text: "A" }]);
  assertEquals(faq({ items }).items, [{
    title: "Q",
    body: [{
      __resolveType: "blog/sections/blocks/Paragraph.tsx",
      html: undefined,
      text: "A",
      block: true,
    }],
  }]);
});

Deno.test("faq block drops items without a usable string title", () => {
  const items = [
    { title: "kept", body: "a" },
    { title: 42, body: "a" },
    { title: { rich: "text" }, body: "a" },
    { title: "", body: "a" },
    { body: "no title" },
    null,
    undefined,
  ];
  assertEquals(faq({ items }).items.map((i: { title: string }) => i.title), [
    "kept",
  ]);
});

Deno.test("faq block ignores non-string answers instead of throwing", () => {
  const items = [{ title: "Q", body: { nested: true }, text: ["x"] }];
  // No usable answer survives the type check, so the question renders alone.
  assertEquals(faq({ items }).items, [{ title: "Q", body: [] }]);
});

Deno.test("faq block gives an answer-less question an empty body", () => {
  assertEquals(faq({ items: [{ title: "Q" }] }).items, [{
    title: "Q",
    body: [],
  }]);
});

Deno.test("faq block tolerates malformed items payloads", () => {
  for (const items of [undefined, null, "not json", "{}", 42, {}]) {
    assertEquals(faq({ items }).items, []);
  }
});
