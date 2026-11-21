import { assert, assertEquals } from "@std/assert";
import { PAGE_CACHE_ALLOWED_KEY } from "@deco/deco/blocks";
import { loader } from "./Page.tsx";

// Minimal fake AppContext exercising exactly what the loader touches.
const fakeCtx = () =>
  ({
    bag: new Map<symbol, unknown>(),
    global: [],
    theme: undefined,
    errorPage: undefined,
    resolverId: "root",
    // deno-lint-ignore no-explicit-any
    get: () => Promise.resolve({}) as any,
    avoidRedirectingToEditor: undefined,
    defaultImageQuality: undefined,
    // deno-lint-ignore no-explicit-any
  }) as any;

const baseProps = { name: "home", sections: [] };
const req = () => new Request("https://farm.example/");

Deno.test("cacheable=true opts the page into caching", async () => {
  const ctx = fakeCtx();
  await loader({ ...baseProps, cacheable: true }, req(), ctx);
  assert(
    ctx.bag.has(PAGE_CACHE_ALLOWED_KEY),
    "expected PAGE_CACHE_ALLOWED_KEY to be set",
  );
  assertEquals(ctx.bag.get(PAGE_CACHE_ALLOWED_KEY), true);
});

Deno.test("cacheable=false does NOT opt in (default behavior preserved)", async () => {
  const ctx = fakeCtx();
  await loader({ ...baseProps, cacheable: false }, req(), ctx);
  assert(!ctx.bag.has(PAGE_CACHE_ALLOWED_KEY));
});

Deno.test("cacheable omitted does NOT opt in", async () => {
  const ctx = fakeCtx();
  await loader({ ...baseProps }, req(), ctx);
  assert(!ctx.bag.has(PAGE_CACHE_ALLOWED_KEY));
});
