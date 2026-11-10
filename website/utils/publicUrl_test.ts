import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { HttpError } from "../../utils/http.ts";
import {
  fetchPublicUrl,
  parsePublicUrl,
  readTextWithLimit,
  type ResolveDns,
} from "./publicUrl.ts";
import { imageRequestHeaders } from "./image/engines/remote/engine.ts";
import assetLoader from "../loaders/asset.ts";
import imageLoader from "../loaders/image.ts";
import redirectsFromCsv from "../loaders/redirectsFromCsv.ts";
import type { AppContext } from "../mod.ts";

const rejected = [
  "file:///proc/self/environ",
  "FILE:///etc/passwd",
  "data:image/png;base64,AAAA",
  "blob:https://example.com/uuid",
  "ftp://example.com/a.png",
  "/relative/image.png",
  "not a url",
  "",
  "http://localhost:8000/",
  "http://LOCALHOST./",
  "http://app.localhost/",
  "http://127.0.0.1/",
  "http://127.1/",
  "http://2130706433/",
  "http://0x7f000001/",
  "http://0.0.0.0/",
  "http://10.0.0.1/",
  "http://100.64.0.1/",
  "http://169.254.169.254/latest/meta-data/",
  "http://172.16.0.1/",
  "http://192.168.0.1/",
  "http://[::1]/",
  "http://[::]/",
  "http://[::ffff:127.0.0.1]/",
  "http://[fd00::1]/",
  "http://[fe80::1]/",
  "http://metadata.google.internal/",
  "http://redis:6379/",
  "http://api.default.svc.cluster.local/",
  "http://printer.local/",
];

Deno.test("parsePublicUrl rejects non-http(s) and internal sources", () => {
  for (const src of rejected) {
    assertThrows(() => parsePublicUrl(src), HttpError, undefined, src);
  }
});

Deno.test("parsePublicUrl accepts public http(s) sources", () => {
  for (
    const src of [
      "https://assets.decocache.com/site/image.png",
      "http://example.com/a b.jpg?w=1",
      "https://8.8.8.8/a.png",
      "https://172.32.0.1/a.png",
      "https://[2606:4700::1111]/a.png",
    ]
  ) {
    assertEquals(parsePublicUrl(src).protocol.startsWith("http"), true, src);
  }
});

const publicDns: ResolveDns = (_hostname, type) =>
  Promise.resolve(type === "A" ? ["93.184.215.14"] : []);

const redirectingFetcher = (locations: Record<string, string>) => {
  const requested: string[] = [];
  const fetcher = (input: URL) => {
    requested.push(input.href);
    const location = locations[input.href];
    return Promise.resolve(
      location
        ? new Response(null, { status: 302, headers: { location } })
        : new Response("ok"),
    );
  };
  return { requested, fetcher };
};

Deno.test("fetchPublicUrl validates every redirect target", async () => {
  const { requested, fetcher } = redirectingFetcher({
    "https://example.com/a.png": "https://cdn.example.com/b.png",
    "https://cdn.example.com/b.png": "http://169.254.169.254/latest/meta-data/",
  });
  await assertRejects(
    () =>
      fetchPublicUrl("https://example.com/a.png", {}, {
        fetcher,
        resolveDns: publicDns,
      }),
    HttpError,
    "URL host is not allowed",
  );
  assertEquals(requested, [
    "https://example.com/a.png",
    "https://cdn.example.com/b.png",
  ]);
});

Deno.test("httpsOnly rejects plain http, including on redirects", async () => {
  assertThrows(
    () => parsePublicUrl("http://example.com/a.csv", { httpsOnly: true }),
    HttpError,
    "URL must be an absolute https URL",
  );
  assertEquals(
    parsePublicUrl("https://example.com/a.csv", { httpsOnly: true }).href,
    "https://example.com/a.csv",
  );

  const { requested, fetcher } = redirectingFetcher({
    "https://example.com/a.csv": "http://example.com/a.csv",
  });
  await assertRejects(
    () =>
      fetchPublicUrl("https://example.com/a.csv", {}, {
        fetcher,
        resolveDns: publicDns,
        httpsOnly: true,
      }),
    HttpError,
    "URL must be an absolute https URL",
  );
  assertEquals(requested, ["https://example.com/a.csv"]);
});

Deno.test("fetchPublicUrl follows public redirects up to a limit", async () => {
  const hops = Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [
      `https://example.com/${i}`,
      `https://example.com/${i + 1}`,
    ]),
  );
  const options = {
    fetcher: redirectingFetcher(hops).fetcher,
    resolveDns: publicDns,
  };

  const response = await fetchPublicUrl("https://example.com/5", {}, options);
  assertEquals(await response.text(), "ok");

  await assertRejects(
    () => fetchPublicUrl("https://example.com/0", {}, options),
    HttpError,
    "Too many redirects",
  );
});

Deno.test("fetchPublicUrl rejects a malformed redirect location", async () => {
  const { fetcher } = redirectingFetcher({
    "https://example.com/a.png": "http://[",
  });
  await assertRejects(
    () =>
      fetchPublicUrl("https://example.com/a.png", {}, {
        fetcher,
        resolveDns: publicDns,
      }),
    HttpError,
    "Invalid redirect location",
  );
});

Deno.test("fetchPublicUrl rejects hosts that resolve to internal addresses", async () => {
  for (
    const records of [
      { A: ["127.0.0.1"], AAAA: [] },
      { A: ["93.184.215.14", "169.254.169.254"], AAAA: [] },
      { A: [], AAAA: ["::1"] },
      { A: [], AAAA: ["::ffff:127.0.0.1"] },
      { A: [], AAAA: ["fd00::1"] },
    ]
  ) {
    const { requested, fetcher } = redirectingFetcher({});
    await assertRejects(
      () =>
        fetchPublicUrl("https://127.0.0.1.nip.io/a.png", {}, {
          fetcher,
          resolveDns: (_hostname, type) => Promise.resolve(records[type]),
        }),
      HttpError,
      "URL host is not allowed",
    );
    assertEquals(requested, [], JSON.stringify(records));
  }

  await assertRejects(
    () =>
      fetchPublicUrl("https://missing.example.com/a.png", {}, {
        fetcher: redirectingFetcher({}).fetcher,
        resolveDns: () => Promise.reject(new Error("NXDOMAIN")),
      }),
    HttpError,
    "URL host could not be resolved",
  );
});

Deno.test("readTextWithLimit stops at the byte limit", async () => {
  assertEquals(await readTextWithLimit(new Response("12345"), 5), "12345");

  await assertRejects(
    () =>
      readTextWithLimit(
        new Response("1", { headers: { "content-length": "6" } }),
        5,
      ),
    HttpError,
  );

  const chunks = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("123"));
      controller.enqueue(new TextEncoder().encode("456"));
      controller.close();
    },
  });
  await assertRejects(
    () => readTextWithLimit(new Response(chunks), 5),
    HttpError,
  );
});

Deno.test("imageRequestHeaders drops credentials", () => {
  const headers = imageRequestHeaders(
    new Request("https://site.com/", {
      headers: {
        cookie: "session=secret",
        authorization: "Bearer secret",
        accept: "image/avif",
        "user-agent": "test",
      },
    }),
  );
  assertEquals(headers.get("cookie"), null);
  assertEquals(headers.get("authorization"), null);
  assertEquals(headers.get("accept"), "image/avif");
  assertEquals(headers.get("user-agent"), "test");
});

Deno.test("image loader refuses file:// sources without reading them", async () => {
  const file = await Deno.makeTempFile();
  await Deno.writeTextFile(file, "SYNTHETIC_SECRET=1");
  try {
    const response = await imageLoader(
      { src: `file://${file}`, width: 10, height: 10 },
      new Request("https://site.com/live/invoke/website/loaders/image.ts"),
      {} as AppContext,
    );
    const body = await response.text();
    assertEquals(response.status, 400);
    assertEquals(body.includes("SYNTHETIC_SECRET"), false);
  } finally {
    await Deno.remove(file);
  }
});

const stubFetch = () => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = (input: string | URL | Request) => {
    requested.push(String(input));
    return Promise.resolve(new Response("a,b\n/from,/to\n"));
  };
  return { requested, restore: () => (globalThis.fetch = originalFetch) };
};

Deno.test("asset loader refuses local and internal sources", async () => {
  const { requested, restore } = stubFetch();
  try {
    for (
      const [src, status] of [
        ["file:///etc/hosts", 400],
        ["http://169.254.169.254/latest/meta-data/", 403],
        ["http://localhost:8000/", 403],
      ] as const
    ) {
      const response = await assetLoader(
        { src },
        new Request("https://site.com/live/invoke/website/loaders/asset.ts"),
        {} as AppContext,
      );
      assertEquals(response.status, status, src);
    }
    assertEquals(requested, []);
  } finally {
    restore();
  }
});

Deno.test("redirectsFromCsv only reads .csv files inside the site", async () => {
  const csv = await Deno.makeTempFile({ dir: Deno.cwd(), suffix: ".csv" });
  const outside = await Deno.makeTempFile({ suffix: ".csv" });
  await Deno.writeTextFile(csv, "from,to\n/old,/new\n");
  await Deno.writeTextFile(outside, "from,to\nSYNTHETIC_KEY,secret\n");
  const traversal = "../".repeat(Deno.cwd().split("/").length) +
    outside.slice(1);
  try {
    const inside = await redirectsFromCsv({
      from: csv.slice(Deno.cwd().length + 1),
      redirects: [],
    });
    assertEquals(inside.map((route) => route.pathTemplate), ["/old"]);

    for (const from of [traversal, outside, "deno.json"]) {
      assertEquals(await redirectsFromCsv({ from, redirects: [] }), [], from);
    }
  } finally {
    await Deno.remove(csv);
    await Deno.remove(outside);
  }
});

Deno.test("redirectsFromCsv refuses internal and plain http URLs", async () => {
  const { requested, restore } = stubFetch();
  try {
    for (
      const from of [
        "https://169.254.169.254/redirects.csv",
        // 203.0.113.0/24 is a public documentation range.
        "http://203.0.113.10/redirects.csv",
        "HTTP://203.0.113.10/redirects.csv",
      ]
    ) {
      assertEquals(await redirectsFromCsv({ from, redirects: [] }), [], from);
    }
    assertEquals(requested, []);
  } finally {
    restore();
  }
});

Deno.test("redirectsFromCsv reads a local file whose name starts with http", async () => {
  const csv = await Deno.makeTempFile({
    dir: Deno.cwd(),
    prefix: "http-",
    suffix: ".csv",
  });
  await Deno.writeTextFile(csv, "from,to\n/old,/new\n");
  try {
    const routes = await redirectsFromCsv({
      from: csv.slice(Deno.cwd().length + 1),
      redirects: [],
    });
    assertEquals(routes.map((route) => route.pathTemplate), ["/old"]);
  } finally {
    await Deno.remove(csv);
  }
});

Deno.test("redirectsFromCsv only fetches remote files in the URL allowlist", async () => {
  const { requested, restore } = stubFetch();
  // An IP literal skips the DNS lookup. The retry test below caches its own
  // URL, so this one uses a different address in the same documentation range.
  const allowed = "https://203.0.113.30/redirects.csv";
  const ctx = {
    whitelistPatterns: [new URLPattern("https://203.0.113.30/*")],
  } as AppContext;
  const redirects = [{ from: "/inline", to: "/target" }];
  const paths = (routes: { pathTemplate: string }[]) =>
    routes.map((route) => route.pathTemplate);
  try {
    assertEquals(
      paths(
        await redirectsFromCsv(
          { from: "https://203.0.113.20/redirects.csv", redirects },
          new Request("https://site.com/"),
          ctx,
        ),
      ),
      ["/inline"],
    );
    assertEquals(requested, []);

    assertEquals(
      paths(
        await redirectsFromCsv(
          { from: allowed, redirects },
          new Request("https://site.com/"),
          ctx,
        ),
      ),
      ["/from", "/inline"],
    );
    assertEquals(requested, [allowed]);

    // A cached file stops being served once its source leaves the allowlist.
    const narrowed = {
      whitelistPatterns: [new URLPattern("https://example.com/*")],
    } as AppContext;
    assertEquals(
      paths(
        await redirectsFromCsv(
          { from: allowed, redirects },
          new Request("https://site.com/"),
          narrowed,
        ),
      ),
      ["/inline"],
    );
  } finally {
    restore();
  }
});

Deno.test("redirectsFromCsv retries a remote file that failed", async () => {
  const originalFetch = globalThis.fetch;
  const responses = [
    new Response("unavailable", { status: 503 }),
    new Response("from,to\n/old,/new\n"),
  ];
  globalThis.fetch = () => Promise.resolve(responses.shift()!);
  // An IP literal skips the DNS lookup; 203.0.113.0/24 is a documentation range.
  const from = "https://203.0.113.10/redirects.csv";
  try {
    assertEquals(await redirectsFromCsv({ from, redirects: [] }), []);
    const routes = await redirectsFromCsv({ from, redirects: [] });
    assertEquals(routes.map((route) => route.pathTemplate), ["/old"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
