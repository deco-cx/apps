export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import { MultivariateFlag } from "deco/blocks/flag.ts";
import { Section } from "deco/blocks/section.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";

/**
 * @title Page Variants
 */
export default function PageVariants(
  props: MultivariateProps<Section[]>,
): MultivariateFlag<Section[]> {
  return multivariate(props);
}
