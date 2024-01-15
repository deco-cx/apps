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
export interface PullStateOpts {}
export interface AddChangeSetOpts {
  changeSet: ChangeSet;
}

export interface ForkOpts {
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

export interface DiffSinceOpts {
  since?: string;
}

export type DiffOpts = DiffSinceOpts;
export const isDiffSinceOpts = (opts: DiffOpts): opts is DiffSinceOpts => {
  return (opts as DiffSinceOpts)?.since !== undefined;
};
export interface Branch {
  name: string;
  head(): Promise<string>;
  pull(opts?: PullStateOpts): Promise<State>;
  add(opts: AddChangeSetOpts): void;
  fork(opts: ForkOpts): Promise<Branch>;
  commit(opts?: CommitOpts): Promise<State>;
  listen(opts?: ListenOpts): AsyncIterableIterator<ChangeSet[]>;
  diff(opts?: DiffOpts): Promise<ChangeSet[]>;
}

export interface SyncOpts {
  from: Branch;
  to: Branch;
}

export interface MergeOpts {
  from: Branch;
  to: Branch;
}

export interface CheckoutOpts {
  branchName: string;
}

export interface Release {
  revision: string;
  alias?: string;
  state: () => Promise<State>;
}

export interface PushOpts {
  branch: Branch;
}

export interface Repository {
  checkout(opts?: CheckoutOpts): Promise<Branch>;
  sync(opts: SyncOpts): Disposable;
  merge(opts: MergeOpts): Promise<State>;
  push(opts: PushOpts): Promise<State>;
}

export interface StateProvider {
  push(opts: ChangeSet[]): Promise<State>;
}

export class Local implements Repository {
  constructor(protected defaultBranch: Branch) {}
  checkout(_opts?: CheckoutOpts): Promise<Branch> {
    return Promise.resolve(this.defaultBranch);
  }
  push(opts: PushOpts): Promise<State> {
    return opts.branch.commit();
  }
  sync({ from, to }: SyncOpts): Disposable {
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
        cs.value.forEach((cs) => to.add({ changeSet: cs }));
        await Promise.race([to.commit(), abort.notified()]);
      }
    })();

    return {
      dispose: () => {
        abort.notifyAll();
      },
    };
  }
  async merge({ from, to }: SyncOpts): Promise<State> {
    const diff = await from.diff({ since: await to.head() });
    diff.forEach((cs) => to.add({ changeSet: cs }));
    return to.commit();
  }
}
