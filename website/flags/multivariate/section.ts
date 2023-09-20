export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import { MultivariateFlag } from "deco/blocks/flag.ts";
import { Section } from "deco/blocks/section.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";

/**
 * @title Section Variants
 */
export default function SectionVariants(
  props: MultivariateProps<Section>,
): MultivariateFlag<Section> {
  return multivariate(props);
}
