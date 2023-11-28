import {
  default as extend,
  Props,
} from "../../../../website/loaders/extension.ts";
import { Suggestion } from "../../../types.ts";

export { onBeforeResolveProps } from "../../../../website/loaders/extension.ts";

/**
 * @title Extend your product
 */
export default function ProductDetailsExt(
  props: Props<Suggestion | null>,
): Promise<Suggestion | null> {
  return extend(props);
}
