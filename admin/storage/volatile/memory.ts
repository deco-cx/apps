import { RepositoryState, StateProvider, ZERO_STATE } from "../mod.ts";
export class MemoryStateProvider implements StateProvider {
  private state: RepositoryState = ZERO_STATE;
  sync(state: RepositoryState): Promise<void> {
    this.state = state;
    return Promise.resolve();
  }
  fetch(): Promise<RepositoryState> {
    return Promise.resolve(this.state);
  }
}
