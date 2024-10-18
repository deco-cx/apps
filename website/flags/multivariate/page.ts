export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";
import { type MultivariateFlag, type Section } from "@deco/deco/blocks";
/**
 * @title Page Variants
 */
export default function PageVariants(
  props: MultivariateProps<Section[]>,
): MultivariateFlag<Section[]> {
  return multivariate(props);
}
