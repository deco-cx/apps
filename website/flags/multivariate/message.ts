export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import { MultivariateFlag } from "deco/blocks/flag.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";

export type Message = string;

/**
 * @title Message Variants
 */
export default function Message(
  props: MultivariateProps<Message>,
): MultivariateFlag<Message> {
  return multivariate(props);
}
