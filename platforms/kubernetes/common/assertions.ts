import { badRequest } from "deco/mod.ts";

export function assertsOrBadRequest(
  value: unknown,
  ...params: Parameters<typeof badRequest>
): asserts value {
  if (!value) {
    badRequest(...params);
  }
}
