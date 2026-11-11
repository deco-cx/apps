import { assertEquals } from "@std/assert";
import { snippet } from "../components/_Controls.tsx";
// Brings the global `window.LIVE` declaration into scope.
import type {} from "../mod.ts";

type Listener = (event: unknown) => void;

const setup = ({ framed }: { framed: boolean }) => {
  const listeners: Listener[] = [];
  const parent = {};
  const win: Record<string, unknown> = {
    location: { origin: "https://site.example", pathname: "/", search: "" },
  };
  win.parent = framed ? parent : win;

  const g = globalThis as unknown as Record<string, unknown>;
  const previous = {
    window: g.window,
    document: g.document,
    addEventListener: g.addEventListener,
  };
  g.window = win;
  g.document = { body: { addEventListener: () => {} } };
  g.addEventListener = (type: string, fn: Listener) => {
    if (type === "message") listeners.push(fn);
  };

  snippet({
    site: { id: 1, name: "site" },
    flags: [],
    trustedOrigins: ["https://admin.deco.cx"],
  });

  const restore = () => Object.assign(g, previous);
  const dispatch = (event: unknown) => listeners.forEach((fn) => fn(event));
  return { parent, win, dispatch, restore };
};

const inject = (value: string) => ({
  type: "editor::inject",
  args: { script: `globalThis.__websiteControlsPwned = "${value}"` },
});

Deno.test("website LiveControls postMessage handling", async (t) => {
  const g = globalThis as unknown as Record<string, unknown>;

  await t.step("ignores editor::inject from untrusted origins", () => {
    const { parent, dispatch, restore } = setup({ framed: true });
    try {
      dispatch({
        source: parent,
        origin: "https://evil.example",
        data: inject("evil"),
      });
      dispatch({ source: parent, origin: "null", data: inject("null") });
      assertEquals(g.__websiteControlsPwned, undefined);
    } finally {
      restore();
    }
  });

  await t.step(
    "ignores editor::inject from windows other than the parent",
    () => {
      const { dispatch, restore } = setup({ framed: true });
      try {
        dispatch({
          source: {},
          origin: "https://admin.deco.cx",
          data: inject("other"),
        });
        assertEquals(g.__websiteControlsPwned, undefined);
      } finally {
        restore();
      }
    },
  );

  await t.step("ignores editor::inject when not framed (window.open)", () => {
    const { win, dispatch, restore } = setup({ framed: false });
    try {
      dispatch({
        source: win,
        origin: "https://admin.deco.cx",
        data: inject("popup"),
      });
      assertEquals(g.__websiteControlsPwned, undefined);
    } finally {
      restore();
    }
  });

  await t.step("runs editor::inject from a trusted parent editor", () => {
    const { parent, dispatch, restore } = setup({ framed: true });
    try {
      dispatch({
        source: parent,
        origin: "https://admin.deco.cx",
        data: inject("admin"),
      });
      assertEquals(g.__websiteControlsPwned, "admin");
      delete g.__websiteControlsPwned;
      dispatch({
        source: parent,
        origin: "http://localhost:4200",
        data: inject("local"),
      });
      assertEquals(g.__websiteControlsPwned, "local");
    } finally {
      delete g.__websiteControlsPwned;
      restore();
    }
  });
});
