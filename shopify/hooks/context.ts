import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Runtime } from "../runtime.ts";
import { Cart } from "../utils/types.ts";

interface Context {
  cart: Cart;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<Cart | null>(null),
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

const load = async (signal: AbortSignal) => {
  const cart = await Runtime.shopify.loaders.cart({}, {signal})

  return {
    cart,
  };
};

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
