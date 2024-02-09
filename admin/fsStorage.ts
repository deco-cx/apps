import { Context } from "deco/deco.ts";
import { Resolvable } from "deco/engine/core/resolver.ts";
import { DECO_FILE_NAME, newFsProvider } from "deco/engine/releases/fs.ts";
import {
  OnChangeCallback,
  ReadOptions,
  Release,
} from "deco/engine/releases/provider.ts";
import { join } from "std/path/mod.ts";
import { BlockStore } from "./mod.ts";

export class MemoryBlockStorage implements BlockStore {
  protected callbacks: OnChangeCallback[] = [() => {
    const ctx = Context.active();
    ctx.release?.set?.(this._state);
  }];
  protected _revision: string = crypto.randomUUID();
  constructor() {
  }

  get _state(): Promise<Record<string, Resolvable>> {
    const ctx = Context.active();
    return ctx.release?.state?.() ?? Promise.resolve({});
  }
  set _state(value) {
    value.then((v) => {
      const ctx = Context.active();
      ctx.release?.set?.(v);
    });
  }
  async mergeWith(other: Record<string, Resolvable>) {
    const currentState = await this._state;
    return { ...currentState, ...other };
  }
  async patch(
    resolvables: Record<string, Resolvable>,
  ): Promise<Record<string, Resolvable>> {
    this._state = this.mergeWith(resolvables);
    await this.notify();
    return this._state;
  }
  async set(
    resolvables: Record<string, Resolvable>,
    revision?: string,
  ): Promise<void> {
    this._state = Promise.resolve(resolvables);
    await this.notify(revision);
  }
  async notify(revision?: string) {
    await this._state;
    this._revision = revision ?? crypto.randomUUID();
    this.callbacks.forEach((cb) => cb());
  }
  async delete(id: string): Promise<void> {
    const state = await this._state;
    delete state[id];
    this._state = Promise.resolve(state);
    await this.notify();
  }
  state(
    _options?: ReadOptions | undefined,
  ): Promise<Record<string, Resolvable>> {
    return this._state;
  }
  archived(
    _options?: ReadOptions | undefined,
  ): Promise<Record<string, Resolvable>> {
    return Promise.resolve({});
  }
  revision(): Promise<string> {
    return Promise.resolve(this._revision);
  }
  onChange(callback: OnChangeCallback): void {
    this.callbacks.push(callback);
  }
  dispose?: (() => void) | undefined;
}
export class FsBlockStorage implements BlockStore {
  protected _readOnly: Release | undefined;
  protected path: string;
  constructor(protected fileName = DECO_FILE_NAME) {
    this.path = join(Deno.cwd(), fileName);
  }

  get readOnly() {
    return this._readOnly ??= newFsProvider(this.fileName);
  }

  async set(resolvables: Record<string, Resolvable>): Promise<void> {
    await Deno.writeTextFile(this.path, JSON.stringify(resolvables));
  }

  async patch(
    resolvables: Record<string, Resolvable>,
  ): Promise<Record<string, Resolvable>> {
    const state = await this.state();
    const merged = { ...state, ...resolvables };
    await this.set(merged);
    return merged;
  }

  async delete(id: string): Promise<void> {
    const state = await this.state();
    if (state[id]) {
      delete state[id];
      await this.set(state);
    }
  }

  state(
    options?: ReadOptions | undefined,
  ): Promise<Record<string, Resolvable>> {
    return this.readOnly.state(options);
  }
  archived(
    options?: ReadOptions | undefined,
  ): Promise<Record<string, Resolvable>> {
    return this.readOnly.archived(options);
  }
  revision(): Promise<string> {
    return this.readOnly.revision();
  }
  onChange(callback: OnChangeCallback): void {
    return this.readOnly.onChange(callback);
  }
}

const hasWritePerm = async (): Promise<boolean> => {
  return await Deno.permissions.query(
    { name: "write" } as const,
  ).then((status) => status.state === "granted");
};
export const storage = await hasWritePerm()
  ? new FsBlockStorage()
  : new MemoryBlockStorage();
