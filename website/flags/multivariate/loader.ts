import { MultivariateFlag } from "deco/blocks/flag.ts";
import { Loader } from "deco/blocks/loader.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";

/**
 * @title Loader Variants
 */
export default function LoaderVariants(
  props: MultivariateProps<Loader>,
): MultivariateFlag<Loader> {
  return multivariate(props);
}
