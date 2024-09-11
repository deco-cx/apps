export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import { MultivariateFlag } from "deco/blocks/flag.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";
import { ImageWidget } from "../../../admin/widgets.ts";

/**
 * @title Image Variants
 */
export default function Image(
  props: MultivariateProps<ImageWidget>,
): MultivariateFlag<ImageWidget> {
  return multivariate(props);
}
