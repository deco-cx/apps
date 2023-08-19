import { FlagObj } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/flag.ts";
export { onBeforeResolveProps } from "./everyone.ts";

export type Props<T> = FlagObj<T>;

/**
 * @title Flag
 */
export default function Flag<T>({
  matcher,
  name,
  true: T,
  false: F,
}: Props<T>): FlagObj<T> {
  return {
    matcher,
    true: T,
    false: F,
    name,
  };
}
