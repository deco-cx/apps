import { invoke } from "../runtime.ts";
import { state as storeState } from "./context.ts";

const { user, loading } = storeState;

const state = {
  user,
  loading,
  updateUser: async () => {
    loading.value = true;
    user.value = await invoke.wake.loaders.user();
    loading.value = false;
  },
};

export const useUser = () => state;
