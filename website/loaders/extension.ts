import { PromiseOrValue } from "$live/engine/core/utils.ts";

/**
 * @title The type extension.
 */
export type ExtensionOf<T> = (value: T) => PromiseOrValue<T>;

export interface Props<T> {
  /**
   * @title Data
   * @description Here comes your products or anything that can be extensible.
   */
  data: T;
  /**
   * @title The data Extensions
   */
  extensions: ExtensionOf<T>[];
}

export default async function Extended<T>(
  { data, extensions }: Props<T>,
): Promise<T> {
  let result = data;
  for (const extension of Array.isArray(extensions) ? extensions : []) {
    result = await extension?.(result);
  }
  return result;
}
