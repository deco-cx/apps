import { state as storeState } from "../hooks/context.ts";

const { cart, loading } = storeState;

const state = {
  cart,
  loading,
};

export const useCart = () => state;
