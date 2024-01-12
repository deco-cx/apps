import { dirname, join } from "std/path/mod.ts";
import { InMemory } from "../memory/store.ts";
import {
  AddChangeSetOpts,
  BranchOpts,
  ChangeSet,
  CommitOpts,
  DiffSinceOpts,
  FetchStateOpts,
  ListenOpts,
  State,
  Storage,
} from "../mod.ts";

export class Disk implements Storage {
  protected stash: Promise<InMemory>;
  protected directory: string;
  constructor(protected filePath: string, changeSet?: ChangeSet[]) {
    if (changeSet) {
      this.stash = Promise.resolve(new InMemory([...changeSet]));
    } else {
      this.stash = Deno.readTextFile(filePath).then((text) =>
        new InMemory(JSON.parse(text))
      );
    }
    this.directory = dirname(filePath);
  }
  revision(): Promise<string> {
    return this.stash.then((s) => s.revision());
  }
  async fetch(opts?: FetchStateOpts | undefined): Promise<State> {
    const stash = await this.stash;
    return stash.fetch(opts);
  }
  add(opts: AddChangeSetOpts): void {
    this.stash = this.stash.then((stash) => {
      stash.add(opts);
      return stash;
    });
  }
  async branch(opts: BranchOpts): Promise<Storage> {
    const stash = await this.stash;
    return new Disk(
      join(this.directory, `${opts.name}.json`),
      await stash.diff(),
    );
  }

  async commit(opts?: CommitOpts | undefined): Promise<State> {
    const stash = await this.stash;
    const state = await stash.commit(opts);
    const cs = await stash.diff();
    await Deno.writeTextFile(this.filePath, JSON.stringify(cs)); // FIXME(mcandeia) racing condition between listen and this.
    return state;
  }
  async *listen(
    opts?: ListenOpts | undefined,
  ): AsyncIterableIterator<ChangeSet> {
    const stash = await this.stash;
    return yield* stash.listen(opts);
  }
  async diff(opts: DiffSinceOpts): Promise<ChangeSet[]> {
    const stash = await this.stash;
    return stash.diff(opts);
  }
}
