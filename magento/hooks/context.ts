// deno-lint-ignore-file no-explicit-any
import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { invoke } from "../runtime.ts";
import type { Cart } from "../loaders/cart.ts";
import { Wishlist } from "../utils/client/types.ts";
import { SESSION_STORAGE_KEY } from "../utils/constants.ts";
import { decodeFeatures } from "../utils/utils.ts";

export interface Context {
  cart: Cart;
  wishlist: Wishlist | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<Cart | null>(null),
  wishlist: signal<Wishlist | null>(null),
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
      const { cart, wishlist } = await cb(controller.signal);

      if (controller.signal.aborted) {
        throw { name: "AbortError" };
      }

      context.cart.value = cart || context.cart.value;
      context.wishlist.value = wishlist || context.wishlist.value;

      loading.value = false;
    } catch (error) {
      loading.value = false;

      if (error.name === "AbortError") return;
      if (error.name === "SyntaxError") throw new Error(error);
    }
  });

  abort = () => controller.abort();

  return queue;
};

const load = (signal: AbortSignal, disableWishlist: boolean) =>
  invoke(
    {
      cart: invoke.magento.loaders.cart(),
      ...(!disableWishlist
        ? { wishlist: invoke.magento.loaders.wishlist() }
        : null),
    },
    { signal },
  );

if (IS_BROWSER) {
  const sessionFeatures = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const features = decodeFeatures(sessionFeatures);
  console.log(features);

  if (!features.dangerouslyDisableOnLoadUpdate) {
    console.log("ativou o onload")
    enqueue((signal) =>
      load(signal, features.dangerouslyDisableWishlist) as any
    );
  }

  if (!features.dangerouslyDisableOnVisibilityChangeUpdate) {
    document.addEventListener(
      "visibilitychange",
      () =>
        document.visibilityState === "visible" &&
        enqueue((signal) =>
          load(signal, features.dangerouslyDisableWishlist) as any
        ),
    );
  }
}

export const state = {
  ...context,
  loading,
  enqueue,
};
