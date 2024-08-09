export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import { MultivariateFlag } from "@deco/deco/blocks";
import { ImageWidget } from "../../../admin/widgets.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";

/**
 * @title Image Variants
 */
export default function Image(
  props: MultivariateProps<ImageWidget>,
): MultivariateFlag<ImageWidget> {
  return multivariate(props);
}
