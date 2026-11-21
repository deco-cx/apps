import { assert, assertEquals } from "@std/assert";
import type { Product } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import extend from "./extend.ts";

// A reviews-and-ratings call that never answers unless its signal aborts.
const hang = (_: unknown, init?: { signal?: AbortSignal }) =>
  new Promise<Response>((_, reject) =>
    init?.signal?.addEventListener("abort", () => reject(init.signal!.reason))
  );

Deno.test("reviews extension does not wait on a stalled reviews API", async () => {
  const ctx = {
    my: {
      "GET /reviews-and-ratings/api/reviews": hang,
      "GET /reviews-and-ratings/api/rating/:inProductGroupWithId": hang,
    },
  } as unknown as AppContext;
  const products = [
    { "@type": "Product", productID: "1", sku: "1", inProductGroupWithID: "1" },
  ] as Product[];

  const started = performance.now();
  const result = await extend(
    { products, reviews: true },
    new Request("http://localhost"),
    ctx,
  );

  assert(performance.now() - started < 10_000);
  assertEquals(result[0].aggregateRating?.ratingCount, 0);
  assertEquals(result[0].review, []);
});
