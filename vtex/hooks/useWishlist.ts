// deno-lint-ignore-file no-explicit-any
import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { WishlistItem } from "../utils/types.ts";
import { state as storeState } from "./context.ts";

const { wishlist, loading } = storeState;

type EnqueuableActions<
  K extends keyof Manifest["actions"],
> = Manifest["actions"][K]["default"] extends
  (...args: any[]) => Promise<WishlistItem[] | null> ? K : never;

const enqueue = <
  K extends keyof Manifest["actions"],
>(key: EnqueuableActions<K>) =>
(props: Parameters<Manifest["actions"][K]["default"]>[0]) =>
  storeState.enqueue((signal) =>
    invoke({ wishlist: { key, props } } as any, { signal }) as any
  );

const getItem = (item: Partial<WishlistItem>) =>
  wishlist.value?.find((id) => id.productId == item.productId);

const state = {
  wishlist,
  loading,
  getItem,
  addItem: enqueue("vtex/actions/wishlist/addItem.ts"),
  removeItem: enqueue("vtex/actions/wishlist/removeItem.ts"),
};

export const useWishlist = () => state;
