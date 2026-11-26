import { assertEquals, assertStrictEquals } from "@std/assert";
import type { Routes } from "../flags/audience.ts";
import { draftAppRoutes, stashRawRoutes } from "./draftRoutes.ts";

const pagesLoader = { __resolveType: "website/loaders/pages.ts" };
const proxyLoader = { __resolveType: "vtex/loaders/proxy.ts" };
const route = (pathTemplate: string) => ({
  pathTemplate,
  handler: { value: { __resolveType: "website/handlers/fresh.ts" } },
});
const publishedPages = [route("/")] as unknown as Routes;
const draftPages = [route("/"), route("/new")] as unknown as Routes;
const proxyRoutes = [route("/proxy/*")] as unknown as Routes;
const inline = [route("/*")] as unknown as Routes;

// Stands in for `ctx.get` on a draft request.
const draftResolver = (overrides: Map<unknown, () => unknown> = new Map()) => {
  const calls: unknown[] = [];
  const resolve = (entry: Routes) => {
    calls.push(entry);
    const override = overrides.get(entry);
    if (override) return Promise.resolve().then(override) as Promise<Routes>;
    if (entry === (pagesLoader as unknown)) return Promise.resolve(draftPages);
    if (entry === (proxyLoader as unknown)) return Promise.resolve(proxyRoutes);
    return Promise.resolve(entry);
  };
  return { resolve, calls };
};

const raw = [proxyLoader, pagesLoader, inline] as unknown as Routes[];
const installed = [proxyRoutes, publishedPages, inline];

Deno.test("draftAppRoutes re-resolves only the pages loader", async () => {
  const { resolve, calls } = draftResolver();
  const routes = await draftAppRoutes(stashRawRoutes(raw), installed, resolve);
  assertEquals(routes, [proxyRoutes, draftPages, inline]);
  assertEquals(calls, [pagesLoader]);
});

Deno.test("draftAppRoutes accepts an unwrapped stash", async () => {
  const { resolve } = draftResolver();
  assertEquals(await draftAppRoutes(raw, installed, resolve), [
    proxyRoutes,
    draftPages,
    inline,
  ]);
});

Deno.test("draftAppRoutes resolves the whole config when an entry was dropped", async () => {
  // A multivariate flag with no matching variant resolves to nothing, so
  // install dropped it and `installed` is one entry short.
  const flag = { __resolveType: "website/flags/multivariate.ts" };
  const withFlag = [flag, pagesLoader, inline] as unknown as Routes[];
  const { resolve, calls } = draftResolver(new Map([[flag, () => undefined]]));
  const routes = await draftAppRoutes(
    stashRawRoutes(withFlag),
    [publishedPages, inline],
    resolve,
  );
  assertEquals(routes, [draftPages, inline]);
  assertEquals(calls, withFlag);
});

Deno.test("draftAppRoutes keeps the installed pages when the draft fails", async () => {
  const { resolve } = draftResolver(
    new Map([
      [
        pagesLoader,
        () => {
          throw new Error("broken draft");
        },
      ],
    ]),
  );
  const error = console.error;
  console.error = () => {};
  try {
    assertEquals(await draftAppRoutes(raw, installed, resolve), installed);
  } finally {
    console.error = error;
  }
});

Deno.test("draftAppRoutes leaves configs without a pages loader alone", async () => {
  const { resolve, calls } = draftResolver();
  const noPages = [proxyLoader, inline] as unknown as Routes[];
  const installedNoPages = [proxyRoutes, inline];
  assertStrictEquals(
    await draftAppRoutes(noPages, installedNoPages, resolve),
    installedNoPages,
  );
  assertStrictEquals(
    await draftAppRoutes(undefined, installed, resolve),
    installed,
  );
  assertEquals(calls, []);
});
