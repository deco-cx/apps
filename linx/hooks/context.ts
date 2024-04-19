import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { invoke } from "../runtime.ts";
import type { CartResponse } from "../utils/types/basketJSON.ts";

export interface Context {
  cart: CartResponse | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<CartResponse | null>(null),
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
      const result = await cb(controller.signal);
      const cart = result.cart ?? null;

      if (controller.signal.aborted) {
        throw { name: "AbortError" };
      }

      if (cart !== null) {
        context.cart.value = {
          ...context.cart.value,
          ...cart,
        };
      }

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
