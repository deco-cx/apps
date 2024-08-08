export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import type { MultivariateFlag } from "@deco/deco/blocks";
import type { ImageWidget } from "../../../admin/widgets.ts";
import multivariate, {
  type MultivariateProps,
} from "../../utils/multivariate.ts";

/**
 * @title Image Variants
 */
export default function Image(
  props: MultivariateProps<ImageWidget>,
): MultivariateFlag<ImageWidget> {
  return multivariate(props);
}
