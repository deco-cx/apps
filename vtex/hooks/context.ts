import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Person } from "../../commerce/types.ts";
import { invoke } from "../runtime.ts";
import type { OrderForm } from "../utils/types.ts";
import { WishlistItem } from "../utils/types.ts";

export interface Context {
  cart: OrderForm | null;
  user: Person | null;
  wishlist: WishlistItem[] | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<OrderForm | null>(null),
  user: signal<Person | null>(null),
  wishlist: signal<WishlistItem[] | null>(null),
};

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

      context.cart.value = cart || context.cart.value;
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

const load = (signal: AbortSignal) =>
  invoke({
    cart: invoke.vtex.loaders.cart(),
    user: invoke.vtex.loaders.user(),
    wishlist: invoke.vtex.loaders.wishlist({ allRecords: true }),
  }, { signal });

if (IS_BROWSER) {
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
