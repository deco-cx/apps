import { state as storeState } from "../hooks/context.ts";
import { invoke } from "../runtime.ts";

const { cart, loading } = storeState;

const state = {
  cart,
  loading,
  simulate: invoke.magento.actions.cart.simulation,
};

export const useCart = () => state;
