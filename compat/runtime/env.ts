// compat/runtime/env.ts
// Environment variables abstraction for apps

declare const Deno: {
  env: {
    get(key: string): string | undefined;
    has(key: string): boolean;
    set(key: string, value: string): void;
  };
} | undefined;

const isDeno = typeof Deno !== "undefined";

export const env = {
  get: (key: string): string | undefined => {
    if (isDeno) {
      return Deno!.env.get(key);
    }
    return process.env[key];
  },

  has: (key: string): boolean => {
    if (isDeno) {
      return Deno!.env.has(key);
    }
    return key in process.env && process.env[key] !== undefined;
  },

  set: (key: string, value: string): void => {
    if (isDeno) {
      Deno!.env.set(key, value);
    } else {
      process.env[key] = value;
    }
  },
};

