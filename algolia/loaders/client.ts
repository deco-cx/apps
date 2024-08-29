import type { AppContext } from "../mod.ts";
import type { SearchClient } from "https://esm.sh/algoliasearch@4.24.0";

export type AlgoliaClient = SearchClient;

export default function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): AlgoliaClient {
  const { client } = ctx;

  return client;
}
