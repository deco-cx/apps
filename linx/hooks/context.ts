import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { invoke } from "../runtime.ts";
import type { CartResponse } from "../utils/types/basketJSON.ts";
import { UserResponse } from "../utils/types/userJSON.ts";
import { SearchWishlistResponse } from "../utils/types/wishlistJSON.ts";

export interface Context {
  cart: CartResponse | null;
  user: UserResponse | null;
  wishlist: SearchWishlistResponse | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<CartResponse | null>(null),
  user: signal<UserResponse | null>(null),
  wishlist: signal<SearchWishlistResponse | null>(null),
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
      const { user, cart, wishlist } = await cb(controller.signal);

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
    cart: invoke.linx.loaders.cart(),
    user: invoke.linx.loaders.user(),
    wishlist: invoke.linx.loaders.wishlist.search(),
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
