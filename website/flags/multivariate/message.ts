export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import type { MultivariateFlag } from "@deco/deco/blocks";
import multivariate, {
  type MultivariateProps,
} from "../../utils/multivariate.ts";

export type Message = string;

/**
 * @title Message Variants
 */
export default function Message(
  props: MultivariateProps<Message>,
): MultivariateFlag<Message> {
  return multivariate(props);
}
