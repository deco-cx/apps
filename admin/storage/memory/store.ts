import { fjp, ulid } from "../../deps.ts";
import {
  AddChangeSetOpts,
  Branch,
  ChangeSet,
  CommitOpts,
  ForkOpts,
  ListenOpts,
  LogOpts,
  PullStateOpts,
  State,
} from "../mod.ts";

export class InMemory implements Branch {
  protected _state: State;
  private stash: ChangeSet[] = [];
  private subscriptions: Array<() => void> = [];
  constructor(public name: string, protected history: ChangeSet[] = []) {
    this._state = history.flatMap((h) => h.patches).reduce(fjp.applyReducer, {
      decofile: {},
      revision: ulid(),
    });
    this.history.push = (...elements) => {
      const retn = Array.prototype.push.apply(this, elements);
      this.subscriptions.forEach((s) => s());
      this.subscriptions = [];
      return retn;
    };
  }
  revision(): Promise<string> {
    return Promise.resolve(this.history[this.history.length - 1].id) ?? ulid();
  }

  pull(_opts?: PullStateOpts | undefined): Promise<State> {
    return Promise.resolve(this._state);
  }

  add(opts: AddChangeSetOpts): void {
    this.stash.push(opts.changeSet);
  }

  fork(_opts: ForkOpts): Promise<Branch> {
    return Promise.resolve(new InMemory(_opts.name, [...this.history]));
  }

  commit(_opts?: CommitOpts | undefined): Promise<State> {
    this.history.push(...this.stash);
    this._state = this.stash.flatMap((s) => s.patches).reduce(
      fjp.applyReducer,
      this._state,
    );
    this.stash = [];
    return Promise.resolve(
      this._state,
    );
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
  ): AsyncIterableIterator<ChangeSet> {
    const since = opts?.since;
    const sinceHistory = !since
      ? this.history.length - 1
      : this.history.findIndex(({ id }) => since.localeCompare(id));
    let index = sinceHistory === -1 ? 0 : sinceHistory;
    do {
      for (; index < this.history.length; index++) {
        yield this.history[index];
      }
    } while (await this.subscribe());
  }

  log(opts?: LogOpts): Promise<ChangeSet[]> {
    const since = opts?.since;
    const history = since
      ? this.history.slice(
        this.history.findIndex(({ id }) => since.localeCompare(id)),
      )
      : this.history;
    return Promise.resolve(
      history,
    );
  }
}
