import { Resolvable } from "deco/engine/core/resolver.ts";
import { fjp, ulid } from "../deps.ts";
import { calculateGitSha1 } from "./hasher.ts";
import { observe } from "./observe.ts";

export type Decofile = Record<string, Resolvable>;

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

export interface ForkOpts {
  provider?: StateProvider;
  head?: string;
  origin?: string;
}

export interface CommitOpts {
  message: string;
  committer: Author;
}

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

export interface CheckoutOpts {
  branchName?: string;
  commitHash?: string;
}

// deno-lint-ignore no-empty-interface
export interface PushOpts {
}

// deno-lint-ignore no-empty-interface
export interface PullOpts {}

export interface Blob {
  hash: string;
}

export interface IStash {
  add(...opts: ChangeSet[]): void;
  state(): Decofile;
  createCommit(opts: CommitOpts): Commit;
  listen(opts?: ListenOpts): AsyncIterableIterator<ChangeSet[]>;
}

export interface RepositoryState {
  trees: Record<string, Record<string, Blob>>;
  blobs: Record<string, Resolvable>;
  branches: Record<string, BranchRef>;
  tags: Record<string, Ref>;
  releases: Record<string, Ref>;
  commits: Record<string, Commit>;
}
export interface IRepository {
  checkout(opts: CheckoutOpts): IRepository;
  push(opts?: PushOpts): Promise<IRepository>;
  pull(opts?: PullOpts): Promise<IRepository>;
  commit(...opts: Commit[]): Promise<IRepository>;
  merge(other: IRepository): Promise<IRepository>;
  stash(): IStash;
  diff(opts?: DiffOpts): Commit[];
  fork(opts?: ForkOpts): IRepository;
  readonly state: Readonly<RepositoryState>;
  readonly origin?: IRepository;
  readonly head: string;
}

export interface Ref {
  hash: string;
}
export interface Commit {
  author: Author;
  committer: Author;
  hash: string;
  parentHashes: string[];
  timestamp: number;
  changes: ChangeSet[];
  message: string;
  snapshot?: Decofile;
}

export interface BranchRef {
  commitHash: string;
  name: string;
}

export interface StateProvider {
  sync(state: RepositoryState): Promise<void>;
  fetch(): Promise<RepositoryState>;
}

const encoder = new TextEncoder();

const buildDecofile = (head: string, state: RepositoryState): Decofile => {
  const current: Decofile = {};
  const tree = state.trees[head];
  const blobs = state.blobs;
  for (const [path, { hash }] of Object.entries(tree)) {
    current[path] = blobs[hash];
  }
  return current;
};

export class Stash implements IStash {
  protected changeSets: ChangeSet[] = [];
  protected _state: Decofile;
  private lastIndex = 0;
  private subscriptions: Array<() => void> = [];
  constructor(protected repoState: RepositoryState, protected head: string) {
    this._state = buildDecofile(head, repoState);
    this.changeSets.push = (...elements) => {
      const retn = Array.prototype.push.apply(this, elements);
      this.subscriptions.forEach((s) => s());
      this.subscriptions = [];
      return retn;
    };
  }
  private subscribe(): Promise<boolean> {
    return new Promise((resolve) => {
      this.subscriptions.push(() => {
        resolve(true);
      });
    });
  }

  async *listen(
    opts?: ListenOpts | undefined,
  ): AsyncIterableIterator<ChangeSet[]> {
    const since = opts?.since;
    const sinceHistory = !since
      ? this.changeSets.length - 1
      : this.changeSets.findIndex(({ id }) => since.localeCompare(id));
    let index = sinceHistory === -1 ? 0 : sinceHistory;
    let subscription;
    do {
      const historyLen = this.changeSets.length; // we should capture the length of the history before we yield since yield pauses the execution and length can change
      subscription = this.subscribe();
      yield this.changeSets.slice(index);
      index = historyLen;
    } while (await subscription);
  }
  add(...opts: ChangeSet[]): void {
    this.changeSets.push(...opts);
  }
  state(): Decofile {
    this._state = this.changeSets.slice(this.lastIndex).flatMap((o) =>
      o.patches
    )
      .reduce(
        fjp.applyReducer,
        this._state,
      );
    this.lastIndex = this.changeSets.length;
    return this._state;
  }
  createCommit({ message, committer }: CommitOpts): Commit {
    return {
      author: {
        name: "unknown",
      },
      message,
      changes: this.changeSets,
      committer,
      hash: ulid(),
      parentHashes: [this.head],
      timestamp: Date.now(),
      snapshot: this._state,
    };
  }
}
async function withCommit(
  head: string,
  state: RepositoryState,
  commit: Commit,
  decofile: Decofile,
): Promise<[RepositoryState, Decofile]> {
  const observed = observe(decofile);
  const newDecofile = commit.changes.flatMap((o) => o.patches)
    .reduce(
      fjp.applyReducer,
      observed.decofile,
    );
  const newHead = commit.hash;
  const blobs: Record<string, Resolvable> = {
    ...state.blobs[head],
  };
  const tree: Record<string, Blob> = { ...state.trees[head] };
  await Promise.all(
    observed.changes.map(async (path) => {
      const value = newDecofile[path];
      const hash = await calculateGitSha1(
        encoder.encode(JSON.stringify(value)),
      );
      blobs[hash] = value;
      tree[path] = { hash };
    }),
  );
  const nextState = {
    ...state,
    tree: {
      ...state.trees,
      [newHead]: tree,
    },
    blobs,
    commits: { ...state.commits, [newHead]: commit },
  };
  return [nextState, newDecofile];
}
const traverse = (state: RepositoryState, head: string): Commit[] => {
  const commit = state.commits[head];
  if (!commit) {
    return [];
  }
  return [commit, ...commit.parentHashes.flatMap((h) => traverse(state, h))];
};

const squash = (head: string, ...commits: Commit[]): Commit => {
  return {
    message: commits.map((c) => c.message).join("\n"),
    author: {
      name: "unknown",
    },
    committer: {
      name: "unknown",
    },
    hash: ulid(),
    changes: commits.flatMap((c) => c.changes),
    parentHashes: [head],
    timestamp: Date.now(),
  };
};
export class Repository implements IRepository {
  public head: string;
  public branch?: string;
  constructor(
    public state: RepositoryState,
    protected provider: StateProvider,
    head: string | BranchRef,
    public origin?: IRepository,
  ) {
    if (typeof head === "string") {
      this.head = head;
    } else {
      this.branch = head.name;
      this.head = state.branches[head.name].commitHash;
    }
  }
  merge(other: IRepository): Promise<IRepository> {
    const commits = other.diff({ since: this.head });
    const squashed = squash(this.head, ...commits);
    return this.commit(squashed).then((r) => r.push());
  }
  stash(): IStash {
    return new Stash(this.state, this.head);
  }
  checkout(opts: CheckoutOpts): IRepository {
    const newHead = opts.commitHash ??
      this.state.branches?.[opts.branchName ?? "main"].commitHash;
    if (!newHead) {
      throw new Error(
        `commit hash not found`,
      );
    }
    return new Repository(
      this.state,
      this.provider,
      newHead,
      this.origin,
    );
  }
  async push(_opts?: PushOpts | undefined): Promise<IRepository> {
    const remote = this.origin;
    if (!remote) {
      await this.provider.sync(this.state);
      return this;
    }
    const diff = this.diff({ since: remote?.origin?.head });
    if (!diff || diff.length === 0) {
      return this;
    }
    const { hash: newHead } = diff[diff.length - 1];
    return new Repository(
      this.state,
      this.provider,
      newHead,
      await remote.commit(...diff).then((repo) => repo.push()),
    );
  }

  async pull(_opts?: PullOpts | undefined): Promise<IRepository> {
    const remote = this.origin;
    if (!remote) {
      const ref = this.branch ? { name: this.branch } as BranchRef : this.head;
      return new Repository(
        await this.provider.fetch(),
        this.provider,
        ref,
        this.origin,
      );
    }
    // pull with rebase
    const [remoteDiff, localDiff] = await Promise.all([
      remote.diff({ since: this.origin?.head }),
      this.diff({ since: this.origin?.head }),
    ]);
    const origin = this.checkout({ commitHash: this.origin?.head }); // common ancestor

    return origin.commit(...remoteDiff, ...localDiff); // rebase
  }
  async commit(...commits: Commit[]): Promise<IRepository> {
    let decofile = buildDecofile(this.head, this.state);
    let state = { ...this.state };
    let head = this.head;
    for (const commit of commits) {
      [state, decofile] = await withCommit(head, state, commit, decofile);
      head = commit.hash;
    }
    return new Repository(state, this.provider, head, this.origin);
  }
  diff(opts?: DiffOpts | undefined): Commit[] {
    const hash = opts?.since ?? this.origin?.head;
    return traverse(this.state, hash!);
  }
  fork(opts?: ForkOpts): IRepository {
    return new Repository(
      this.state,
      opts?.provider ?? this.provider,
      opts?.head ?? this.head,
      this,
    );
  }
}
