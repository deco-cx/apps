import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { HttpError } from "../../../utils/http.ts";
import { fetchImageUrl, imageRequestHeaders, parseImageUrl } from "./fetch.ts";
import loader from "../../loaders/image.ts";
import type { AppContext } from "../../mod.ts";

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

Deno.test("parseImageUrl rejects non-http(s) and internal sources", () => {
  for (const src of rejected) {
    assertThrows(() => parseImageUrl(src), HttpError, undefined, src);
  }
});

Deno.test("parseImageUrl accepts public http(s) sources", () => {
  for (
    const src of [
      "https://assets.decocache.com/site/image.png",
      "http://example.com/a b.jpg?w=1",
      "https://8.8.8.8/a.png",
      "https://172.32.0.1/a.png",
      "https://[2606:4700::1111]/a.png",
    ]
  ) {
    assertEquals(parseImageUrl(src).protocol.startsWith("http"), true, src);
  }
});

Deno.test("fetchImageUrl validates redirect targets", async () => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = (input: string | URL | Request) => {
    requested.push(String(input));
    return Promise.resolve(
      new Response(null, {
        status: 302,
        headers: { location: "http://169.254.169.254/latest/meta-data/" },
      }),
    );
  };
  try {
    await assertRejects(
      () => fetchImageUrl("https://example.com/a.png"),
      HttpError,
    );
    assertEquals(requested, ["https://example.com/a.png"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
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
    const response = await loader(
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
