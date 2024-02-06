// deno-lint-ignore-file no-explicit-any
import { Product } from "../../commerce/types.ts";
import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { WishlistReducedProductFragment } from "../utils/graphql/storefront.graphql.gen.ts";
import { state as storeState } from "./context.ts";

const { wishlist, loading } = storeState;

type EnqueuableActions<
  K extends keyof Manifest["actions"],
> = Manifest["actions"][K]["default"] extends
  (...args: any[]) => Promise<Product[] | null> ? K : never;

const enqueue = <
  K extends keyof Manifest["actions"],
>(key: EnqueuableActions<K>) =>
(props: Parameters<Manifest["actions"][K]["default"]>[0]) =>
  storeState.enqueue((signal) =>
    invoke({ wishlist: { key, props } } as any, { signal }) as any
  );

const getItem = (item: Omit<WishlistReducedProductFragment, "productName">) =>
  wishlist.value?.find((id) => id.productId == item.productId);

const state = {
  wishlist,
  loading,
  getItem,
  addItem: enqueue("wake/actions/wishlist/addProduct.ts"),
  removeItem: enqueue("wake/actions/wishlist/removeProduct.ts"),
};

export const useWishlist = () => state;
