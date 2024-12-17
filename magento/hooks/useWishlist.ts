// deno-lint-ignore-file no-explicit-any
import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Wishlist } from "../utils/client/types.ts";
import { state as storeState } from "./context.ts";

const { wishlist, loading } = storeState;

type EnqueuableActions<
  K extends keyof Manifest["actions"],
> = Manifest["actions"][K]["default"] extends
  (...args: any[]) => Promise<Wishlist | null> ? K : never;

const enqueue = <
  K extends keyof Manifest["actions"],
>(key: EnqueuableActions<K>) =>
(props: Parameters<Manifest["actions"][K]["default"]>[0]) =>
  storeState.enqueue((signal) =>
    invoke({ wishlist: { key, props } } as any, { signal }) as any
  );

const getItem = (item: Partial<Wishlist["items"]>) =>
  wishlist.value.items?.find((id) => id?.product_id == item?.product_id);

const state = {
  wishlist,
  loading,
  getItem,
  addItem: enqueue("magento/actions/wishlist/addItem.ts"),
  removeItem: enqueue("magento/actions/wishlist/removeItem.ts"),
};

export const useWishlist = () => state;
