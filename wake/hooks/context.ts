import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { invoke } from "../runtime.ts";
import type {
  CheckoutFragment,
  WishlistReducedProductFragment,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { Person } from "../../commerce/types.ts";
import { setClientCookie } from "../utils/cart.ts";
import { ShopQuery } from "../utils/graphql/storefront.graphql.gen.ts";

export interface Context {
  cart: Partial<CheckoutFragment>;
  user: Person | null;
  wishlist: WishlistReducedProductFragment[] | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<Partial<CheckoutFragment>>({}),
  user: signal<Person | null>(null),
  wishlist: signal<WishlistReducedProductFragment[] | null>(null),
  shop: signal<ShopQuery["shop"] | null>(null),
};

let queue2 = Promise.resolve();
let abort2 = () => {};

let queue = Promise.resolve();
let abort = () => {};
const enqueue = (
  cb: (signal: AbortSignal) => Promise<Partial<Context>> | Partial<Context>,
) => {
  abort();

  loading.value = true;
  const controller = new AbortController();

  queue = queue.then(async () => {
    try {
      const { cart, user, wishlist } = await cb(controller.signal);

      if (controller.signal.aborted) {
        throw { name: "AbortError" };
      }

      context.cart.value = { ...context.cart.value, ...cart };
      context.user.value = user || context.user.value;
      context.wishlist.value = wishlist || context.wishlist.value;

      loading.value = false;
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error(error);
      loading.value = false;
    }
  });

  abort = () => controller.abort();

  return queue;
};

const enqueue2 = (
  cb: (signal: AbortSignal) => Promise<Partial<Context>> | Partial<Context>,
) => {
  abort2();

  loading.value = true;
  const controller = new AbortController();

  queue2 = queue2.then(async () => {
    try {
      const { shop } = await cb(controller.signal);

      const url = new URL("/api/carrinho", shop.checkoutUrl);

      const { Id } = await fetch(url, { credentials: "include" }).then((r) =>
        r.json()
      );

      if (controller.signal.aborted) {
        throw { name: "AbortError" };
      }

      setClientCookie(Id);
      enqueue(load);

      loading.value = false;
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error(error);
      loading.value = false;
    }
  });

  abort2 = () => controller.abort();

  return queue2;
};

const load2 = (signal: AbortSignal) =>
  invoke({
    shop: invoke.wake.loaders.shop(),
  }, { signal });

const load = (signal: AbortSignal) =>
  invoke({
    cart: invoke.wake.loaders.cart(),
    user: invoke.wake.loaders.user(),
    wishlist: invoke.wake.loaders.wishlist(),
  }, { signal });

if (IS_BROWSER) {
  enqueue2(load2);
  enqueue(load);

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && enqueue(load),
  );
}

export const state = {
  ...context,
  loading,
  enqueue,
};
