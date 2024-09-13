import {
  type Accounts,
  type Apps,
  type Flag,
  type Loader,
  type Page,
  type Section,
} from "@deco/deco/blocks";
import { type LoaderContext, type Resolvable } from "@deco/deco";
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
): Promise<unknown> {
  const mState: Promise<[
    string,
    Resolvable,
  ]>[] = [];
  for (const { key, value } of state) {
    const resolved = get(value).then((resolved) =>
      [key, resolved] as [
        string,
        Resolvable,
      ]
    );
    mState.push(resolved);
  }
  return {
    state: Object.fromEntries(await Promise.all(mState)),
    apps,
  };
}
