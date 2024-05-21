import type { AppContext } from "../mod.ts";

// deno-lint-ignore no-explicit-any
export type AlgoliaClient = any;

export default function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): AlgoliaClient {
  const { client } = ctx;

  return client;
}
