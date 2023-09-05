import { InvocationFuncFor } from "deco/clients/withManifest.ts";
import { invoke } from "../runtime.ts";
import { WishlistItem } from "../utils/types.ts";
import { state as storeState } from "./context.ts";
import { Manifest } from "../manifest.gen.ts";

const { wishlist, loading } = storeState;

type PropsOf<T> = T extends (props: infer P, r: any, ctx: any) => any ? P
  : T extends (props: infer P, r: any) => any ? P
  : T extends (props: infer P) => any ? P
  : never;

type Actions =
  | "vtex/actions/wishlist/addItem.ts"
  | "vtex/actions/wishlist/removeItem.ts";

const action =
  (key: Actions) => (props: PropsOf<InvocationFuncFor<Manifest, typeof key>>) =>
    storeState.enqueue((signal) =>
      invoke({ wishlist: { key, props } }, { signal }) satisfies Promise<
        { wishlist: WishlistItem[] | null }
      >
    );

const getItem = (item: Partial<WishlistItem>) =>
  wishlist.value?.find((id) => id.productId == item.productId);

const state = {
  wishlist,
  loading,
  getItem,
  addItem: action("vtex/actions/wishlist/addItem.ts"),
  removeItem: action("vtex/actions/wishlist/removeItem.ts"),
};

export const useWishlist = () => state;
