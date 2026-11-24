import { assertEquals } from "@std/assert";
import { isRenderedFromRequestProps } from "./renderFromRequest.ts";

const req = (path: string) => new Request(`https://www.example.com${path}`);

Deno.test("isRenderedFromRequestProps flags render and preview routes", () => {
  for (
    const path of [
      "/deco/render?props=%7B%7D",
      "/live/render",
      "/deco/previews/website/sections/Analytics/Analytics.tsx",
      "/live/previews",
    ]
  ) {
    assertEquals(isRenderedFromRequestProps(req(path)), true, path);
  }
});

Deno.test("isRenderedFromRequestProps leaves page renders alone", () => {
  for (
    const path of ["/", "/produto/p", "/deco/rendering", "/s?q=deco/render"]
  ) {
    assertEquals(isRenderedFromRequestProps(req(path)), false, path);
  }
});
