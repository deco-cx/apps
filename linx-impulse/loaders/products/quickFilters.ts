// deno-lint-ignore-file require-await
import { fixSuggestionLink } from "../../utils/transform.ts";
import { QuickFilter } from "../../utils/types/search.ts";
import { LinxEngage } from "./linxEngage.ts";

export interface Props {
  linxEngage: LinxEngage | null;
}
/**
 * @title Linx Impulse Quick Filters
 * @description For use at /lxsearch Product Listing Page loader
 */
const loader = async (props: Props): Promise<QuickFilter[]> => {
  if (!props.linxEngage || !("quickFilters" in props.linxEngage.response)) {
    return [];
  }

  return props.linxEngage.response.quickFilters.map((filter) => ({
    ...filter,
    applyLink: filter.type === "url"
      ? filter.applyLink
      : fixSuggestionLink(filter.applyLink),
  }));
};

export default loader;
