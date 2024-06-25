import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Context, state as storeState } from "./context.ts";

const { cart, loading } = storeState;

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
    cart,
    loading,
    addItems: enqueue("sap/actions/cart/addItems.ts"),
    updateItems: enqueue("sap/actions/cart/updateItems.ts"),
    removeItems: enqueue("sap/actions/cart/removeItems.ts"),
    createDeliveryAddress: enqueue("sap/actions/cart/createDeliveryAddress.ts"),
    setDeliveryAddress: enqueue("sap/actions/cart/setDeliveryAddress.ts"),
};

export const useCart = () => state;
