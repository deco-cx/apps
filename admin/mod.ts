import { Resolvable } from "deco/engine/core/resolver.ts";
import { Release } from "deco/engine/releases/provider.ts";
import type { App, AppContext as AC } from "deco/mod.ts";
import { FsBlockStorage } from "./fsStorage.ts";
import { State as Resolvables } from "./loaders/state.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export const ANONYMOUS = "Anonymous";
export interface BlockStore extends Release {
  update(
    resolvables: Record<string, Resolvable>,
  ): Promise<Record<string, Resolvable>>;
}
export interface State {
  storage: BlockStore;
}

export interface BlockState<TBlock = unknown> {
  id: string;
  site: string;
  createdAt: Date;
  resolveType: string;
  value: TBlock | null;
  createdBy: string;
  revision: string;
}

export interface Props {
  resolvables: Resolvables;
}

/**
 * @title Admin
 */
export default function App(
  { resolvables }: Props,
): App<Manifest, State> {
  return { manifest, state: { storage: new FsBlockStorage() }, resolvables };
}

export type AppContext = AC<ReturnType<typeof App>>;
