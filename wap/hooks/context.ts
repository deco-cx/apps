import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Person } from "../../commerce/types.ts";
import { invoke } from "../runtime.ts";
import { Cart } from "../utils/type.ts";

export interface Context {
  cart: Cart | null;
  user: Person | null;
  wishlist: number[] | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<Cart | null>(null),
  user: signal<Person | null>(null),
  wishlist: signal<number[] | null>(null),
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
      const {
        cart,
        user,
        wishlist,
      } = await cb(controller.signal);

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
    cart: invoke.wap.loaders.cart(),
    user: invoke.wap.loaders.user(),
    wishlist: invoke.wap.loaders.wishlist(),
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
