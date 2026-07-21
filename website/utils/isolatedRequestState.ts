import type { AppContext } from "../mod.ts";

type IsolatedRequestState = Pick<
  AppContext,
  "bag" | "flags" | "response" | "vary"
>;

/**
 * Creates request-scoped state for speculative/deferred resolutions.
 *
 * Resolvers can mutate cache eligibility, flags, response headers and the
 * request bag. Those mutations must not leak when the resolved value is used
 * only to inspect metadata such as a loading fallback.
 */
export const newIsolatedRequestState = (): IsolatedRequestState => {
  const keys: string[] = [];
  const debugEntries: unknown[] = [];

  return {
    bag: new WeakMap(),
    flags: [],
    response: { headers: new Headers() },
    vary: {
      shouldCache: true,
      push: (...key: string[]) => {
        keys.push(...key);
      },
      build: () => keys.sort().join(),
      debug: {
        push: <T>(entry: T) => {
          debugEntries.push(entry);
        },
        build: <T>() => debugEntries as T[],
      },
    },
  };
};
