// compat/runtime/async.ts
// Async utilities - replacement for std/async/deferred.ts

export interface Deferred<T> extends Promise<T> {
  resolve(value: T | PromiseLike<T>): void;
  reject(reason?: unknown): void;
  readonly state: "pending" | "fulfilled" | "rejected";
}

export function deferred<T>(): Deferred<T> {
  let methods: {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  };

  let state: "pending" | "fulfilled" | "rejected" = "pending";

  const promise = new Promise<T>((resolve, reject) => {
    methods = {
      resolve: (value) => {
        state = "fulfilled";
        resolve(value);
      },
      reject: (reason) => {
        state = "rejected";
        reject(reason);
      },
    };
  }) as Deferred<T>;

  Object.defineProperty(promise, "state", {
    get: () => state,
  });

  return Object.assign(promise, methods!);
}

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

