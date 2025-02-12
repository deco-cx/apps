export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";
import { type MultivariateFlag, type Section } from "@deco/deco/blocks";
/**
 * @title Section Variants
 */
export default function SectionVariants(
  props: MultivariateProps<Section>,
): MultivariateFlag<Section> {
  return multivariate(props);
}
