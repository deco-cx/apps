// deno-lint-ignore-file no-explicit-any
import type { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Context, state as storeState } from "./context.ts";

const { wishlist, loading } = storeState;

type EnqueuableActions<
  K extends keyof Manifest["actions"],
> = Manifest["actions"][K]["default"] extends
  (...args: any[]) => Promise<Context["wishlist"]> ? K : never;

const enqueue = <
  K extends keyof Manifest["actions"],
>(key: EnqueuableActions<K>) =>
(props: Parameters<Manifest["actions"][K]["default"]>[0]) =>
  storeState.enqueue((signal) =>
    invoke({ wishlist: { key, props } } as any, { signal }) as any
  );

const state = {
  wishlist,
  loading,
  addItem: enqueue("linx/actions/wishlist/addItem.ts"),
  removeItem: enqueue("linx/actions/wishlist/removeItem.ts"),
  addWishlist: enqueue("linx/actions/wishlist/addWishlist.ts"),
  updateWishlist: enqueue("linx/actions/wishlist/updateWishlist.ts"),
  removeWishlist: enqueue("linx/actions/wishlist/removeWishlist.ts"),
  shareWishlist: enqueue("linx/actions/wishlist/shareWishlist.ts"),
};

export const useWishlist = () => state;
