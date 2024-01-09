import { Accounts } from "deco/blocks/account.ts";
import { Flag } from "deco/blocks/flag.ts";
import { Loader } from "deco/blocks/loader.ts";
import { Page } from "deco/blocks/page.tsx";
import { Section } from "deco/blocks/section.ts";
import { Resolvable } from "deco/engine/core/resolver.ts";
import { Apps, LoaderContext } from "deco/mod.ts";
import { MiddlewareConfig } from "deco/runtime/fresh/middlewares/3_main.ts";

/**
 * @titleBy key
 */
export interface StateProp {
  key: string;
  value: Accounts | Flag | Section | Loader | Page;
}
export interface Props {
  state: StateProp[];
  apps?: Apps[];
}

/**
 * @title Shared application State Loader.
 * @description Set the application state using resolvables.
 */
export default async function StateLoader(
  { state, apps }: Props,
  _req: Request,
  { get }: LoaderContext,
): Promise<MiddlewareConfig> {
  const mState: Promise<[string, Resolvable]>[] = [];

  for (const { key, value } of state) {
    const resolved = get(value).then((resolved) =>
      [key, resolved] as [string, Resolvable]
    );
    mState.push(resolved);
  }

  return {
    state: Object.fromEntries(await Promise.all(mState)),
    apps,
  };
}
