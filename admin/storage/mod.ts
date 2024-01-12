import { Resolvable } from "deco/engine/core/resolver.ts";
import { type fjp, Notify } from "../deps.ts";

export interface Author {
  name: string;
}
export interface ChangeSetMetadata {
  authors: Author[];
  timestamp: number;
}
export interface ChangeSet {
  id: string;
  patches: fjp.Operation[];
  metadata: ChangeSetMetadata;
}

export type Decofile = Record<string, Resolvable>;

export interface State {
  decofile: Decofile;
  revision: string;
}
// deno-lint-ignore no-empty-interface
export interface FetchStateOpts {}
export interface AddChangeSetOpts {
  changeSet: ChangeSet;
}

export interface BranchOpts {
  name: string;
}

// deno-lint-ignore no-empty-interface
export interface CommitOpts {}
export interface ListenOpts {
  since?: string;
}

export interface Disposable {
  dispose(): void;
}

export interface SyncOpts {
  storage: Storage;
}

export interface DiffSinceOpts {
  since?: string;
}

export type DiffOpts = DiffSinceOpts;
export const isDiffSinceOpts = (opts: DiffOpts): opts is DiffSinceOpts => {
  return (opts as DiffSinceOpts)?.since !== undefined;
};
export interface Storage {
  revision(): Promise<string>;
  fetch(opts?: FetchStateOpts): Promise<State>;
  add(opts: AddChangeSetOpts): void;
  branch(opts: BranchOpts): Promise<Storage>;
  commit(opts?: CommitOpts): Promise<State>;
  listen(opts?: ListenOpts): AsyncIterableIterator<ChangeSet>;
  diff(opts?: DiffOpts): Promise<ChangeSet[]>;
}

export const sync = (from: Storage, to: Storage): Disposable => {
  const abort = new Notify();
  (async () => {
    const csStream = from.listen();
    while (true) {
      const cs = await Promise.race([abort.notified(), csStream.next()]);
      if (typeof cs !== "object") {
        return;
      }
      if (cs.done) {
        return;
      }
      to.add({ changeSet: cs.value });
      await to.commit();
    }
  })();

  return {
    dispose: () => {
      abort.notifyAll();
    },
  };
};

export const merge = async (from: Storage, to: Storage): Promise<State> => {
  const diff = await from.diff({ since: await to.revision() });
  diff.forEach((cs) => to.add({ changeSet: cs }));
  return to.commit();
};
