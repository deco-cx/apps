import { PromiseOrValue } from "deco/engine/core/utils.ts";

/**
 * @title The type Mapped.
 */
export type MappedOf<T, K> = (value: T) => PromiseOrValue<K>;

export interface Props<T, K> {
  /**
   * @title Data to map
   * @description Receive the data to be mapped.
   */
  data: T;
  /**
   * @title Map loader
   * @description Transform the received data in canonical data.
   */
  mapping: MappedOf<T, K>;
}

// Merge user props with invoke props
export const onBeforeResolveProps = <T, K>(
  { data, mapping, ...props }: Props<T, K>,
) => ({ data: { ...data, ...props }, mapping });

export default async function Mapped<T, K>(
  { data, mapping }: Props<T, K>,
): Promise<K> {
  return await mapping?.(data);
}
