import { MultivariateFlag, Variant } from "deco/blocks/flag.ts";
import { asResolved } from "deco/engine/core/resolver.ts";

/**
 * @title Multivariate
 * @multivariate true
 */
export interface MultivariateProps<T> {
  /**
   * @minItems 1
   * @addBehavior 1
   */
  variants: Variant<T>[];
}

/**
 * @title Variant
 * @label hidden
 */
export default function MultivariateFlag<T>(
  props: MultivariateProps<T>,
): MultivariateFlag<T> {
  return props;
}

const isMultivariateProps = (
  props: unknown | MultivariateProps<unknown>,
): props is MultivariateProps<unknown> => {
  return (props as MultivariateProps<unknown>)?.variants !== undefined &&
    Array.isArray((props as MultivariateProps<unknown>)?.variants);
};

const isVariant = (
  variant: unknown | Variant<unknown>,
): variant is Variant<unknown> => {
  return (variant as Variant<unknown>).value !== undefined &&
    typeof variant === "object";
};

/**
 * This is used to avoid resolving flag values before matcher is actually evaluated
 */
export const onBeforeResolveProps = (props: unknown) => {
  if (isMultivariateProps(props)) {
    const newVariants = [];
    for (const variant of props.variants) {
      if (isVariant(variant)) {
        newVariants.push({
          ...variant,
          value: asResolved(variant.value, true),
        });
      } else {
        newVariants.push(variant);
      }
    }
    if (newVariants.length > 0) { // avoid shallow copy
      return {
        ...props,
        variants: newVariants,
      };
    }
    return props;
  }
  return props;
};
