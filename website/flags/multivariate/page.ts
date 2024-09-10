export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import type { MultivariateFlag, Section } from "@deco/deco/blocks";
import multivariate, {
  type MultivariateProps,
} from "../../utils/multivariate.ts";

/**
 * @title Page Variants
 */
export default function PageVariants(
  props: MultivariateProps<Section[]>,
): MultivariateFlag<Section[]> {
  return multivariate(props);
}
