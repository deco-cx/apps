import { state as storeState } from "./context.ts";

const { segment, loading } = storeState;

const state = { segment, loading };

export const useSegment = () => state;
