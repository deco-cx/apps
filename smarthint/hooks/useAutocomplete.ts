import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";
import type { Suggestion } from "../../commerce/types.ts";
import { invoke } from "../runtime.ts";

const payload = signal<Suggestion | null>(null);
const loading = signal<boolean>(false);

const suggestions = invoke.smarthint.loaders.autocomplete;

const setSearch = debounce(
  async (search: string, sizeProducts?: number, sizeTerms?: number) => {
    try {
      payload.value = await suggestions({
        query: search,
        sizeProducts,
        sizeTerms,
      });
    } catch (error) {
      console.error(
        "Something went wrong while fetching suggestions \n",
        error,
      );
    } finally {
      loading.value = false;
    }
  },
  250,
);

const state = {
  setSearch: (query?: string, sizeProducts?: number, sizeTerms?: number) => {
    loading.value = true;
    setSearch(query, sizeProducts, sizeTerms);
  },
  loading,
  suggestions: payload,
};

/**
 * This hook only works if the vtex intelligent search app is installed at VTEX Account.
 */
export const useAutocomplete = () => state;
