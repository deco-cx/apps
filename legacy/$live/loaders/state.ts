import { Accounts } from "$live/blocks/account.ts";
import { Flag } from "$live/blocks/flag.ts";
import { Loader } from "$live/blocks/loader.ts";
import { Page } from "$live/blocks/page.ts";
import { Section } from "$live/blocks/section.ts";
import { Resolvable } from "$live/engine/core/resolver.ts";
import { Apps, LoaderContext } from "$live/mod.ts";
import { MiddlewareConfig } from "$live/routes/_middleware.ts";

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
