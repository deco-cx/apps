// deno-lint-ignore-file no-explicit-any
type AnyObject = Record<string, any>;

/**
 * merges objects in place
 */
export function deepMerge<T extends AnyObject>(target: T, source: T): void {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        source[key] && typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {} as any; // Type assertion, assuming object type
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}
