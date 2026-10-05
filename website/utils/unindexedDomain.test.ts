import { assertEquals } from "@std/assert";
import { isUnindexedDomain } from "./unindexedDomain.ts";

const req = (url: string, forwardedHost?: string) =>
  new Request(url, {
    headers: forwardedHost === undefined
      ? {}
      : { "x-forwarded-host": forwardedHost },
  });

Deno.test("preview domains are unindexed", () => {
  assertEquals(isUnindexedDomain(req("https://farmrio.deco.site/")), true);
  assertEquals(isUnindexedDomain(req("https://farmrio.decocdn.com/")), true);
  assertEquals(isUnindexedDomain(req("https://site.deno.dev/")), true);
});

Deno.test("production domains are indexed", () => {
  assertEquals(isUnindexedDomain(req("https://www.farmrio.com.br/")), false);
});

Deno.test("a proxied preview origin uses the forwarded public host", () => {
  assertEquals(
    isUnindexedDomain(
      req(
        "https://farmrio.deco.site/produtos/vestido-longo",
        "www.farmrio.com.br",
      ),
    ),
    false,
  );
});

Deno.test("a forwarded preview host is unindexed regardless of case", () => {
  assertEquals(
    isUnindexedDomain(req("https://www.farmrio.com.br/", "FARMRIO.DECO.SITE")),
    true,
  );
});

Deno.test("only the first value of a chained forwarded host counts", () => {
  assertEquals(
    isUnindexedDomain(
      req(
        "https://farmrio.deco.site/",
        "www.farmrio.com.br, farmrio.deco.site",
      ),
    ),
    false,
  );
});

Deno.test("an empty forwarded host falls back to the request URL", () => {
  assertEquals(
    isUnindexedDomain(req("https://farmrio.deco.site/", "  ")),
    true,
  );
});
