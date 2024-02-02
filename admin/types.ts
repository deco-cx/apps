import { type Resolvable } from "deco/engine/core/resolver.ts";
import { type fjp } from "./deps.ts";

export interface Pagination<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PatchState {
  type: "patch-state";
  payload: fjp.Operation[];
}

export interface FetchState {
  type: "fetch-state";
}

export interface StatePatched {
  type: "state-patched";
  payload: fjp.Operation[];
  etag: string;
  // Maybe add data and user info in here
  metadata?: unknown;
}

export interface StateFetched {
  type: "state-fetched";
  payload: State;
  etag: string;
}

export interface OperationFailed {
  type: "operation-failed";
  code: "UNAUTHORIZED" | "INTERNAL_SERVER_ERROR";
  reason: string;
}

export type Acked<T> = T & { ack: string };

export interface State {
  decofile: Record<string, Resolvable>;
}

export type Commands = PatchState | FetchState;
export type Events = StatePatched | StateFetched | OperationFailed;
