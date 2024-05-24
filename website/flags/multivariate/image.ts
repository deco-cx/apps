export { onBeforeResolveProps } from "../../utils/multivariate.ts";
import { MultivariateFlag } from "deco/blocks/flag.ts";
import multivariate, { MultivariateProps } from "../../utils/multivariate.ts";

/**
 * @format image-uri
 */
export type ImageFlag = string;

/**
 * @title Image Variants
 */
export default function Message(
    props: MultivariateProps<ImageFlag>,
  ): MultivariateFlag<ImageFlag> {
    return multivariate(props);
  }
  