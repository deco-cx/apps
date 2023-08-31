import { invoke } from "../runtime.ts";
import { WishlistItem } from "../utils/types.ts";
import { state as storeState } from "./context.ts";

const { wishlist, loading } = storeState;

const wrap = <T>(
  action: (
    props?: T,
    init?: RequestInit | undefined,
  ) => Promise<WishlistItem[] | null>,
) =>
(props?: T) =>
  storeState.enqueue(async (signal) => ({
    wishlist: await action(props, { signal }),
  }));

const addItem = wrap(
  invoke.vtex.actions.wishlist.addItem,
);
const removeItem = wrap(
  invoke.vtex.actions.wishlist.removeItem,
);

const getItem = (item: Partial<WishlistItem>) =>
  wishlist.value?.find((id) => id.productId == item.productId);

const state = {
  wishlist,
  loading,
  addItem,
  getItem,
  removeItem,
};

export const useWishlist = () => state;
