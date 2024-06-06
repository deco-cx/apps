/**
 * By importing this file, you will get a `wasm` module added to your server
 * while it's booting. If it fails to load, your server will hang indefinitely.
 *
 * Use at your own risk.
 */

import initSwc, {
  transformSync,
} from "https://cdn.jsdelivr.net/npm/@swc/wasm-web/wasm-web.js";
import { LRU } from "../../utils/lru.ts";

await initSwc(
  "https://cdn.jsdelivr.net/npm/@swc/wasm-web@1.5.25/wasm-web_bg.wasm",
);

const cache = LRU(100);

const minify = (js: string) => {
  const start = performance.now();

  const code = transformSync(js, {
    minify: true,
    jsc: {
      target: "esnext",
      minify: { mangle: true, format: { comments: false } },
    },
  }, undefined).code.replace(/;$/, "");
  const duration = performance.now() - start;

  cache.set(js, code);

  console.log(
    `[htmx]: ${duration}ms minifiying script ${
      js.slice(0, 38).replace(/(\n|\s)+/g, " ")
    }...`,
  );

  return code;
};

// deno-lint-ignore no-explicit-any
export function useScript<T extends (...args: any[]) => any>(
  fn: T,
  ...params: Parameters<T>
) {
  const javascript = fn.toString();
  const minified = cache.get(javascript) || minify(javascript);

  return `(${minified})(${params.map((p) => JSON.stringify(p)).join(", ")})`;
}
