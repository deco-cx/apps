import { Resolvable } from "deco/engine/core/resolver.ts";
import { newFsProvider } from "deco/engine/releases/fs.ts";
import {
    OnChangeCallback,
    ReadOptions,
    Release,
} from "deco/engine/releases/provider.ts";
import { join } from "std/path/mod.ts";
import { BlockStore } from "./mod.ts";

export class FsBlockStorage implements BlockStore {
  protected readOnly: Release;
  protected path: string;
  constructor(path = ".release.json") {
    this.readOnly = newFsProvider(path);
    this.path = join(Deno.cwd(), path);
  }
  async update(
    resolvables: Record<string, Resolvable>,
  ): Promise<Record<string, Resolvable>> {
    const state = await this.state();
    const merged = { ...state, ...resolvables };
    await Deno.writeTextFile(this.path, JSON.stringify(merged));
    return merged;
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
