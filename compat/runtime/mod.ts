// compat/runtime/mod.ts
// Runtime compatibility layer for apps
// Provides cross-runtime abstractions for Deno, Node.js, and Bun

export * from "./env.ts";
export * from "./inspect.ts";
export * as colors from "./colors.ts";
export * from "./async.ts";
export { parseMediaType } from "./media-types.ts";

// Runtime detection
declare const Deno: unknown;
declare const Bun: unknown;

export const isDeno = typeof Deno !== "undefined";
export const isBun = typeof Bun !== "undefined" && !isDeno;
export const isNode = !isDeno && !isBun && typeof process !== "undefined";
export const runtime: "deno" | "bun" | "node" = isDeno
  ? "deno"
  : isBun
    ? "bun"
    : "node";

