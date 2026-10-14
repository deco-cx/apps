import { assertEquals, assertNotEquals } from "@std/assert";
import { cacheKey, type Props } from "./productListingPage.ts";
import type { AppContext } from "../../mod.ts";

const ctx = {
  bag: new Map(),
  cachedSearchTerms: ["vibrador"],
} as unknown as AppContext;

const key = (path: string, props: Props = { count: 12 }) =>
  cacheKey(props, new Request(`https://shop.example${path}`), ctx);

Deno.test("cacheKey: legacy map URLs are cacheable and keyed on map", () => {
  const brand = key("/pepper-blend?map=b");
  const category = key("/pepper-blend?map=c");

  assertNotEquals(brand, null);
  assertNotEquals(category, null);
  assertNotEquals(brand, category);
  assertEquals(new URL(brand!).searchParams.get("map"), "b");
});

Deno.test("cacheKey: fmap and PS are part of the key", () => {
  const base = "/lingerie/body?map=c,c";

  assertNotEquals(key(`${base}&fmap=c`), key(`${base}&fmap=c,c`));
  assertNotEquals(key(base), key(`${base}&fmap=c`));
  assertNotEquals(key(`${base}&PS=12`), key(`${base}&PS=48`));
});

Deno.test("cacheKey: keys for URLs without map, fmap or PS are unchanged", () => {
  assertEquals(
    key("/lingerie"),
    "https://shop.example/lingerie?count=12&filters=&fq=&ft=&ignoreCaseSelected=false&map=&page=1&pageOffset=1&segment=&sort=OrderByPriceDESC&term=%2Flingerie",
  );
  assertEquals(
    key("/lingerie?page=2&O=OrderByPriceASC"),
    "https://shop.example/lingerie?count=12&filters=&fq=&ft=&ignoreCaseSelected=false&map=&page=2&pageOffset=1&segment=&sort=OrderByPriceASC&term=%2Flingerie",
  );
  assertEquals(
    key("/lingerie?filter.color=red&utm_source=x"),
    "https://shop.example/lingerie?count=12&filter.color=red&filters=&fq=&ft=&ignoreCaseSelected=false&map=&page=1&pageOffset=1&segment=&sort=OrderByPriceDESC&term=%2Flingerie",
  );
  assertEquals(
    key("/s?q=vibrador"),
    "https://shop.example/s?count=12&filters=&fq=&ft=vibrador&ignoreCaseSelected=false&map=&page=1&pageOffset=1&segment=&sort=OrderByPriceDESC&term=%2Fs",
  );
});

Deno.test("cacheKey: search terms not in cachedSearchTerms stay uncached", () => {
  assertEquals(key("/s?q=other"), null);
  assertEquals(key("/s?q=other&map=ft"), null);
});
