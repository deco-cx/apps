import { assertEquals, assertNotStrictEquals } from "@std/assert";
import { newIsolatedRequestState } from "./isolatedRequestState.ts";

Deno.test("newIsolatedRequestState does not share resolver side effects", () => {
  const first = newIsolatedRequestState();
  const second = newIsolatedRequestState();

  first.vary.shouldCache = false;
  first.vary.push("weather/loaders/temperature.ts", "rio-de-janeiro");
  first.flags.push({
    name: "weather",
    value: true,
    isSegment: false,
  });
  first.response.headers.set("set-cookie", "personalized=true");

  assertNotStrictEquals(first.vary, second.vary);
  assertNotStrictEquals(first.flags, second.flags);
  assertNotStrictEquals(first.response, second.response);
  assertNotStrictEquals(first.bag, second.bag);
  assertEquals(first.vary.shouldCache, false);
  assertEquals(
    first.vary.build(),
    "rio-de-janeiro,weather/loaders/temperature.ts",
  );
  assertEquals(second.vary.shouldCache, true);
  assertEquals(second.vary.build(), "");
  assertEquals(second.flags, []);
  assertEquals(second.response.headers.has("set-cookie"), false);
});
