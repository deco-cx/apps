export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import type { MultivariateFlag, Section } from "@deco/deco/blocks";
import multivariate, {
  type MultivariateProps,
} from "../../utils/multivariate.ts";

/**
 * @title Section Variants
 */
export default function SectionVariants(
  props: MultivariateProps<Section>,
): MultivariateFlag<Section> {
  return multivariate(props);
}
