import { signal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { WishlistItem } from "apps/vtex/utils/types.ts";
import { Runtime } from "apps/vtex/runtime.ts";
import type { OrderForm } from "apps/vtex/utils/types.ts";
import type { User } from "apps/vtex/loaders/user.ts";

interface Context {
  cart: OrderForm | null;
  user: User | null;
  wishlist: WishlistItem[] | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<OrderForm | null>(null),
  user: signal<User | null>(null),
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
  Runtime.invoke({
    cart: {
      key: "apps/vtex/loaders/cart.ts",
    },
    user: {
      key: "apps/vtex/loaders/user.ts",
    },
    wishlist: {
      key: "apps/vtex/loaders/wishlist.ts",
    },
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
