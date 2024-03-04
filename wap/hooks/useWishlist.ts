// deno-lint-ignore-file no-explicit-any
import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { state as storeState } from "./context.ts";

const { wishlist, loading } = storeState;

type EnqueuableActions<
  K extends keyof Manifest["actions"],
> = Manifest["actions"][K]["default"] extends
  (...args: any[]) => Promise<number[] | null> ? K : never;

const enqueue = <
  K extends keyof Manifest["actions"],
>(key: EnqueuableActions<K>) =>
(props: Parameters<Manifest["actions"][K]["default"]>[0]) =>
  storeState.enqueue((signal) =>
    invoke({ wishlist: { key, props } } as any, { signal }) as any
  );

const getItem = (item: number) => wishlist.value?.find((id) => id == item);

const state = {
  wishlist,
  loading,
  getItem,
  addItem: enqueue("wap/actions/wishlist/addItem.ts"),
  removeItem: enqueue("wap/actions/wishlist/removeItem.ts"),
};

export const useWishlist = () => state;
