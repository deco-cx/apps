// deno-lint-ignore-file require-await
import { fixSuggestionLink } from "../../utils/transform.ts";
import { Suggestion } from "../../utils/types/search.ts";
import { LinxEngage } from "./linxEngage.ts";

export interface Props {
  linxEngage: LinxEngage | null;
}
/**
 * @title Linx Impulse Suggestions
 * @description For use at /lxsearch Product Listing Page loader
 */
const loader = async (
  props: Props,
): Promise<Suggestion[]> => {
  if (!props.linxEngage || !("suggestions" in props.linxEngage.response)) {
    return [];
  }

  return props.linxEngage.response.suggestions.map((suggestion) => ({
    ...suggestion,
    link: fixSuggestionLink(suggestion.link),
  }));
};

export default loader;
