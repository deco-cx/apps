import { assertEquals } from "@std/assert";
import { Context } from "@deco/deco";
import { router } from "../handlers/router.ts";

/** Resolves a handler to a Response that echoes what it was asked to run. */
const resolver =
  ((handler: unknown) => () => Response.json(handler)) as unknown as Parameters<
    typeof router
  >[2];

const serve = async (
  url: string,
  hrefRoutes: Record<string, unknown> = {},
) => {
  const res = await router(
    [{
      pathTemplate: "/*",
      handler: { value: { __resolveType: "page" } },
    }],
    hrefRoutes as Parameters<typeof router>[1],
    resolver,
  )(
    new Request(url),
    { state: {} } as unknown as Parameters<
      ReturnType<typeof router>
    >[1],
  );
  return res.json();
};

Deno.test("exact redirects from the decofile provider come before pages", async () => {
  const ctx = Context.active() as { release?: unknown };
  const previous = ctx.release;
  ctx.release = {
    exactRedirect: (path: string) =>
      Promise.resolve(
        path === "/old" ? { to: "/new", type: "permanent" } : null,
      ),
  };
  try {
    assertEquals(await serve("https://site.com/old?x=1"), {
      __resolveType: "website/handlers/redirect.ts",
      to: "/new",
      type: "permanent",
    });
    assertEquals(await serve("https://site.com/other"), {
      __resolveType: "page",
    });
    // A decofile exact redirect still wins.
    assertEquals(
      await serve("https://site.com/old", {
        "/old": { __resolveType: "decofile-redirect" },
      }),
      { __resolveType: "decofile-redirect" },
    );
  } finally {
    ctx.release = previous;
  }
});

Deno.test("a failing exactRedirect never fails the page", async () => {
  const ctx = Context.active() as { release?: unknown };
  const previous = ctx.release;
  ctx.release = { exactRedirect: () => Promise.reject(new Error("KV down")) };
  try {
    assertEquals(await serve("https://site.com/old"), {
      __resolveType: "page",
    });
  } finally {
    ctx.release = previous;
  }
});

Deno.test("a provider without exactRedirect changes nothing", async () => {
  const ctx = Context.active() as { release?: unknown };
  const previous = ctx.release;
  ctx.release = {};
  try {
    assertEquals(await serve("https://site.com/old"), {
      __resolveType: "page",
    });
  } finally {
    ctx.release = previous;
  }
});
