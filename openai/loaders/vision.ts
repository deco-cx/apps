import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @description the links of the site that contains images
   * @examples "https://www.instagram.com/marcoscandeia"
   */
  url: string;
  /**
   * @description what kind of description do you want?
   * @examples you can ask for something like "What’s in this image?"\n or "Is there a car?"
   */
  request?: string;
  /**
   * @description
   * @examples 5
   * @default 5
   */
  imageCount?: number;
}

const getImagesFrom = async (url: string): Promise<string[]> => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  );
  const images: string[] = [];
  page.on("response", (response) => {
    const headers = response.headers();
    const contentType = headers["Content-Type"] ?? headers["content-type"];
    if (contentType?.includes("jpeg")) {
      images.push(response.url());
    }
  });
  await page.goto(url);
  await page.waitForNetworkIdle({ idleTime: 3000 });
  await browser.close();
  return images;
};
/**
 * @title GPT Vision search by link
 * @examples give me https://www.instagram.com/marcoscandeia and I'll give you "kids, beach, sun, cars and motocycles, deco.cx".
 */
export type Description = string;

// by default consider the 5-first images.
const DEFAULT_IMAGE_COUNT = 5;
const imagesCache: Record<string, Promise<string[]>> = {};
export default async function (
  { url, request, imageCount }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Description[]> {
  if (url && ctx.visionFineTunning[url]) {
    return ctx.visionFineTunning[url];
  }
  imagesCache[url] ??= getImagesFrom(url);
  const images = await imagesCache[url];
  if (images.length === 0) {
    return [];
  }
  const response = await ctx.openAI.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: request ?? "What’s in this image?" },
          ...images.slice(0, imageCount ?? DEFAULT_IMAGE_COUNT).map((image) => {
            return {
              type: "image_url" as const,
              image_url: {
                "url": image,
              },
            };
          }),
        ],
      },
    ],
  });
  return response.choices.map((choice) => choice.message.content!).filter(
    Boolean,
  );
}
