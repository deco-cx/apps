import { assert, assertEquals, assertRejects } from "@std/assert";
import { HttpError } from "../../utils/http.ts";
import { readBytesWithLimit, readTextWithLimit } from "./publicUrl.ts";
import extractAllLinks from "../../google-sites/loaders/extractAllLinks.ts";
import searchContent from "../../google-sites/loaders/searchContent.ts";
import type { AppContext as GoogleSitesContext } from "../../google-sites/mod.ts";
import pineconeUpload from "../../pinecone-assistant/actions/upload.ts";
import type { AppContext as PineconeContext } from "../../pinecone-assistant/mod.ts";
import { handleAttachments } from "../../decopilot-app/utils/handleAttachments.ts";

// URLs an integration app must never fetch on behalf of request input. None
// of them needs DNS to be refused, so the tests stay offline.
const internal = [
  "file:///etc/hosts",
  "http://169.254.169.254/latest/meta-data/",
  "http://localhost:8000/",
  "http://127.0.0.1/",
  "http://10.0.0.1/",
  "http://kubernetes.default.svc/",
  "http://[::1]/",
];

const stubFetch = () => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = (input: string | URL | Request) => {
    requested.push(input instanceof Request ? input.url : String(input));
    return Promise.resolve(new Response("SYNTHETIC_SECRET"));
  };
  return { requested, restore: () => (globalThis.fetch = originalFetch) };
};

const req = new Request("https://site.com/live/invoke");

Deno.test("readBytesWithLimit stops at the byte limit", async () => {
  assertEquals(
    await readBytesWithLimit(new Response("abc"), 3),
    new TextEncoder().encode("abc"),
  );
  assertEquals(await readTextWithLimit(new Response("çã"), 4), "çã");
  await assertRejects(
    () => readBytesWithLimit(new Response("abcd"), 3),
    HttpError,
    "larger than 3 bytes",
  );
});

Deno.test("google-sites extractAllLinks refuses internal URLs", async () => {
  const { requested, restore } = stubFetch();
  try {
    for (const siteUrl of internal) {
      const result = await extractAllLinks({ siteUrl }, req);
      assertEquals(result.total, 0, siteUrl);
      assert(!JSON.stringify(result).includes("SYNTHETIC_SECRET"), siteUrl);
    }
    assertEquals(requested, []);
  } finally {
    restore();
  }
});

Deno.test("google-sites searchContent refuses internal URLs", async () => {
  const { requested, restore } = stubFetch();
  try {
    for (const siteUrl of internal) {
      const result = await searchContent(
        { siteUrl, query: "SYNTHETIC_SECRET" },
        req,
        {} as GoogleSitesContext,
      );
      assertEquals(result.results, [], siteUrl);
    }
    assertEquals(requested, []);
  } finally {
    restore();
  }
});

Deno.test("pinecone-assistant upload refuses internal file URLs", async () => {
  const { requested, restore } = stubFetch();
  try {
    for (const fileUrl of internal) {
      const result = await pineconeUpload(
        { fileUrl },
        req,
        {} as PineconeContext,
      );
      assertEquals(result.success, false, fileUrl);
    }
    assertEquals(requested, []);
  } finally {
    restore();
  }
});

Deno.test("decopilot attachments refuse internal file URLs", async () => {
  const { requested, restore } = stubFetch();
  try {
    for (const fileUrl of internal) {
      for (const fileType of [".csv", ".json", ".png"] as const) {
        await assertRejects(
          () => handleAttachments([{ type: "URL", fileUrl, fileType }]),
          Error,
          undefined,
          `${fileType} ${fileUrl}`,
        );
      }
    }
    assertEquals(requested, []);
  } finally {
    restore();
  }
});
