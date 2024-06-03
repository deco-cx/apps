import { assertEquals } from "std/assert/mod.ts";
import { DECO_LINX_BASKET_COOKIE, getBasketHint } from "./cart.ts";

Deno.test("[Linx] Basket hint", async (t) => {
  await t.step("Works with empty cookie", () => {
    const h = new Headers();
    const basketId = getBasketHint(h);

    assertEquals(basketId, undefined);
  });

  await t.step("Works with header hint cookie", () => {
    const h = new Headers();
    h.set("cookie", `${DECO_LINX_BASKET_COOKIE}=12345`);
    const basketId = getBasketHint(h);

    assertEquals(basketId, 12345);
  });
});
