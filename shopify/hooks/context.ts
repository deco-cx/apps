import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { invoke } from "../runtime.ts";
import type { CartFragment } from "../utils/storefront/storefront.graphql.gen.ts";

export interface Context {
  cart: CartFragment | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<CartFragment | null>(null),
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
      const { cart } = await cb(controller.signal);

      controller.signal.throwIfAborted();

      context.cart.value = cart ? { ...context.cart.value, ...cart } : null;

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
    cart: invoke.shopify.loaders.cart(),
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
