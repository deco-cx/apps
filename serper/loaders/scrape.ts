import { AppContext } from "../mod.ts";
import { IScrapeParams, IScrapeResult } from "../client.ts";

/**
 * @title Scrape Webpage
 * @description Extract content from a webpage using Serper API
 */
export default async function scrape(
  props: IScrapeParams,
  _req: Request,
  ctx: AppContext,
): Promise<IScrapeResult> {
  if (!props.url) {
    throw new Error("URL is required for scraping");
  }

  const response = await ctx.scrapeApi["POST /"]({}, {
    body: {
      ...props,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Serper API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
