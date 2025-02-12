export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";
import { ImageWidget } from "../../../admin/widgets.ts";
import { type MultivariateFlag } from "@deco/deco/blocks";
/**
 * @title Image Variants
 */
export default function Image(
  props: MultivariateProps<ImageWidget>,
): MultivariateFlag<ImageWidget> {
  return multivariate(props);
}
