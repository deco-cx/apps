import { assertEquals } from "@std/assert";
import { type AppManifest, Deco } from "@deco/deco";
import * as engine from "@deco/deco/engine";
import router from "../handlers/router.ts";
import * as pagesLoader from "../loaders/pages.ts";
import { onBeforeResolveProps } from "../mod.ts";

// A site app wired like the template: `routes` holds the pages loader plus an
// inline catch-all, and the catch-all route is this app's router.
const manifest = {
  name: "site",
  baseUrl: import.meta.url,
  apps: {
    "site/apps/site.ts": {
      default: (state: unknown) => ({
        state,
        manifest,
        resolvables: {
          "./routes/[...catchall].tsx": {
            __resolveType: "website/handlers/router.ts",
            audiences: [],
          },
        },
      }),
      onBeforeResolveProps,
    },
  },
  pages: {
    "website/pages/Page.tsx": {
      default: ({ name }: { name: string }) => ({ name }),
    },
  },
  loaders: { "website/loaders/pages.ts": pagesLoader },
  handlers: {
    "website/handlers/router.ts": { default: router },
    "website/handlers/fresh.ts": {
      // The resolved page block wraps the page's own output in `props`.
      default: ({ page }: { page?: { props?: { name?: string } } }) => () =>
        Response.json({ page: page?.props?.name ?? null }),
    },
    "site/handlers/notFound.ts": {
      default: () => () => Response.json({ page: null }, { status: 404 }),
    },
  },
} as unknown as AppManifest;

const page = (name: string, path: string) => ({
  __resolveType: "website/pages/Page.tsx",
  name,
  path,
});

const published = {
  site: {
    __resolveType: "site/apps/site.ts",
    routes: [
      { __resolveType: "website/loaders/pages.ts" },
      [{
        pathTemplate: "/*",
        handler: { value: { __resolveType: "site/handlers/notFound.ts" } },
      }],
    ],
  },
  "pages-home": page("home", "/"),
  "pages-old": page("old", "/old"),
};

const drafts: Record<string, Record<string, unknown>> = {
  added: { ...published, "pages-new": page("new", "/new") },
  renamed: { ...published, "pages-old": page("old", "/renamed") },
  deleted: { site: published.site, "pages-home": published["pages-home"] },
};

Deno.test({
  name: "Fast Preview drafts route pages that only exist in the draft",
  // Drafts (`?__draft=`) need a deco runtime with Fast Preview.
  ignore: !("resolveDraftForRequest" in engine),
  fn: async (t) => {
    const server = Deno.serve(
      { hostname: "127.0.0.1", port: 0, onListen() {} },
      (req) => Response.json(drafts[new URL(req.url).pathname.slice(1)]),
    );
    try {
      const deco = await Deco.init({
        site: "site",
        manifest,
        decofile: engine.fromJSON(published),
      });
      const visit = async (
        path: string,
        { draft, cookie }: { draft?: string; cookie?: string } = {},
      ) => {
        const url = new URL(path, "http://localhost");
        if (draft) {
          url.searchParams.set(
            "__draft",
            draft === "off"
              ? "off"
              : `127.0.0.1:${server.addr.port}/${draft}@${draft}`,
          );
        }
        const res = await deco.fetch(
          new Request(url, {
            headers: { host: "localhost", ...(cookie ? { cookie } : {}) },
          }),
        );
        const { page } = await res.json();
        return {
          status: res.status,
          page,
          cookie: res.headers.get("set-cookie")?.split(";")[0],
        };
      };
      const expectPage = async (
        path: string,
        expected: string | null,
        options?: { draft?: string; cookie?: string },
      ) => {
        const { status, page } = await visit(path, options);
        assertEquals({ status, page }, {
          status: expected === null ? 404 : 200,
          page: expected,
        });
      };

      await t.step("published routes are unchanged", async () => {
        await expectPage("/", "home");
        await expectPage("/old", "old");
        await expectPage("/new", null);
      });

      await t.step("a page added in the draft is routed", async () => {
        await expectPage("/new", "new", { draft: "added" });
      });

      await t.step(
        "the draft cookie carries it across navigation",
        async () => {
          const { cookie } = await visit("/new", { draft: "added" });
          await expectPage("/new", "new", { cookie });
          await expectPage("/new", null, { draft: "off", cookie });
        },
      );

      await t.step("a renamed page moves to its new path", async () => {
        await expectPage("/renamed", "old", { draft: "renamed" });
        await expectPage("/old", null, { draft: "renamed" });
      });

      await t.step("a deleted page is no longer routed", async () => {
        await expectPage("/old", null, { draft: "deleted" });
      });

      await t.step(
        "concurrent drafts and published stay isolated",
        async () => {
          const results = await Promise.all([
            visit("/new", { draft: "added" }),
            visit("/new"),
            visit("/old", { draft: "deleted" }),
            visit("/old"),
          ]);
          assertEquals(
            results.map(({ status, page }) => [status, page]),
            [[200, "new"], [404, null], [404, null], [200, "old"]],
          );
        },
      );
    } finally {
      await server.shutdown();
    }
  },
});
