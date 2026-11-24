import { assertEquals } from "@std/assert";
import {
  isRenderedFromRequestProps,
  stripTagSettingsFromRequest,
} from "./renderFromRequest.ts";

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

// Both Analytics sections' loaders are `stripTagSettingsFromRequest(props, req)`.
const props: {
  trackingIds?: string[];
  googleAnalyticsIds?: string[];
  src?: string;
  disableAutomaticEventPush?: boolean;
} = {
  trackingIds: ["GTM-AAAA"],
  googleAnalyticsIds: ["G-BBBB"],
  src: "https://metrics.example.com",
  disableAutomaticEventPush: true,
};

Deno.test("stripTagSettingsFromRequest clears tag settings on /deco/render", () => {
  assertEquals(
    stripTagSettingsFromRequest(props, req("/deco/render?props=%7B%7D")),
    {
      ...props,
      trackingIds: undefined,
      googleAnalyticsIds: undefined,
      src: undefined,
    },
  );
});

Deno.test("stripTagSettingsFromRequest keeps props on a page render", () => {
  assertEquals(stripTagSettingsFromRequest(props, req("/")), props);
});
