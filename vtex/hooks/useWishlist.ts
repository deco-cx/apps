import { state as storeState } from "./context.ts";
import { Runtime } from "apps/vtex/runtime.ts";
import { WishlistItem } from "apps/vtex/utils/types.ts";

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
  Runtime.create("apps/vtex/actions/wishlist/addItem.ts"),
);
const removeItem = wrap(
  Runtime.create("apps/vtex/actions/wishlist/removeItem.ts"),
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
