import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Context, state as storeState } from "./context.ts";

const { user, loading } = storeState;

type EnqueuableActions<
  K extends keyof Manifest["actions"],
> = Manifest["actions"][K]["default"] extends
  (...args: any[]) => Promise<Context["cart"]> ? K : never;

const enqueue = <
  K extends keyof Manifest["actions"],
>(key: EnqueuableActions<K>) =>
(props: Parameters<Manifest["actions"][K]["default"]>[0]) =>
  storeState.enqueue((signal) =>
    invoke({ cart: { key, props } } as any, { signal }) as any
  );

const state = {
  user,
  loading,
  updateUser: enqueue("sap/actions/user/updateUser.ts"),
};

export const useUser = () => state;
