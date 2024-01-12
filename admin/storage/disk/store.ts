import { join } from "std/path/mod.ts";
import { InMemory } from "../memory/store.ts";
import {
  AddChangeSetOpts,
  Branch,
  ChangeSet,
  CommitOpts,
  ForkOpts,
  ListenOpts,
  LogSinceOpts,
  PullStateOpts,
  State,
} from "../mod.ts";
export interface BranchState {
  changeSets: ChangeSet[];
}
export class Disk implements Branch {
  protected stash: Promise<InMemory>;
  protected filePath: string;
  constructor(
    public name: string,
    protected directory: string,
    changeSet?: ChangeSet[],
  ) {
    const memName = `mem:${name}`;
    if (changeSet) {
      this.stash = Promise.resolve(new InMemory(memName, [...changeSet]));
    } else {
      this.stash = Deno.readTextFile(join(directory, name)).then(
        this.parseState,
      ).then(({ changeSets }) => new InMemory(memName, changeSets));
    }
    this.filePath = join(this.directory, name);
  }
  private parseState(text: string): BranchState {
    return JSON.parse(text);
  }
  revision(): Promise<string> {
    return this.stash.then((s) => s.revision());
  }
  async pull(opts?: PullStateOpts | undefined): Promise<State> {
    const stash = await this.stash;
    return stash.pull(opts);
  }
  add(opts: AddChangeSetOpts): void {
    this.stash = this.stash.then((stash) => {
      stash.add(opts);
      return stash;
    });
  }
  async fork(opts: ForkOpts): Promise<Branch> {
    const stash = await this.stash;
    return new Disk(
      opts.name,
      this.directory,
      await stash.log(),
    );
  }

  async commit(opts?: CommitOpts | undefined): Promise<State> {
    const stash = await this.stash;
    const state = await stash.commit(opts);
    const cs = await stash.log();
    await Deno.writeTextFile(this.filePath, JSON.stringify({ changeSets: cs })); // FIXME(mcandeia) racing condition between listen and this.
    return state;
  }
  async *listen(
    opts?: ListenOpts | undefined,
  ): AsyncIterableIterator<ChangeSet> {
    const stash = await this.stash;
    return yield* stash.listen(opts);
  }
  async log(opts: LogSinceOpts): Promise<ChangeSet[]> {
    const stash = await this.stash;
    return stash.log(opts);
  }
}
