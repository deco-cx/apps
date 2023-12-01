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
}

const candeiaImages = Promise.resolve([
  "https://scontent-gig4-2.cdninstagram.com/v/t51.2885-19/173564282_364297854889145_2670003494290065105_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-gig4-2.cdninstagram.com&_nc_cat=105&_nc_ohc=WLNMRCCr1mIAX9FO9Cz&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfDWk5XKeD1tIS9aD9TB-10n3-hfJlTPDrl5BpAdzm4Tcg&oe=656ED4CD&_nc_sid=8b3546",
  "https://scontent-gig4-2.cdninstagram.com/v/t51.12442-15/47581956_930826617123560_7881971772526226114_n.jpg?stp=c0.336.720.720a_dst-jpg_e35_s150x150&_nc_ht=scontent-gig4-2.cdninstagram.com&_nc_cat=108&_nc_ohc=vKoQi5ARGpsAX_LNB5g&edm=AGW0Xe4BAAAA&ccb=7-5&oh=00_AfDI1hoEniTWruvGezNdpLkj7DYzqbqLpWw7Bc2V86WmIw&oe=656B1122&_nc_sid=94fea1",
  "https://scontent-gig4-2.cdninstagram.com/v/t51.12442-15/67119982_1288585001306214_1117853752773459583_n.jpg?stp=c0.506.1080.1080a_dst-jpg_e35_s150x150&_nc_ht=scontent-gig4-2.cdninstagram.com&_nc_cat=106&_nc_ohc=bbOh09P2xWAAX-S9crF&edm=AGW0Xe4BAAAA&ccb=7-5&oh=00_AfCc8qboKpMy0h6UvoFEPxPgb8vRW9cWogcR_yF2eKJSgw&oe=656BA287&_nc_sid=94fea1",
  "https://scontent-gig4-2.cdninstagram.com/v/t51.12442-15/69879820_155250535663850_4765593734197833371_n.jpg?stp=c0.506.1080.1080a_dst-jpg_e35_s150x150&_nc_ht=scontent-gig4-2.cdninstagram.com&_nc_cat=102&_nc_ohc=-qcPvOPn4z0AX8BX-uQ&edm=AGW0Xe4BAAAA&ccb=7-5&oh=00_AfCcvrETdSmPHS7spNmdoJuNeC5Oa9AToH7Lzinkby6mNQ&oe=656B7727&_nc_sid=94fea1",
]);
const imagesCache: Record<string, Promise<string[]>> = {
  ["https://www.instagram.com/marcoscandeia"]: candeiaImages,
  ["https://www.instagram.com/marcoscandeia/"]: candeiaImages,
};

const descriptionsCache: Record<string, string[]> = {
  ["https://www.instagram.com/marcoscandeia"]: [
    "Homem de blusa preta",
    "camisa azul",
    "shorts jeans",
  ],
  ["https://www.instagram.com/anitta"]: [
    "mulher atraente",
    "calcinhas e blusas do brasil",
    "representação do funk",
    "shorts curtos",
    "maquiagens",
    "viagens e mar",
  ],
};
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
export default async function (
  { url, request }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Description[]> {
  if (url && descriptionsCache[url]) {
    return descriptionsCache[url];
  }
  imagesCache[url] ??= getImagesFrom(url);
  const images = await imagesCache[url];
  if (images.length === 0) {
    return [];
  }
  console.log(JSON.stringify({ images }));
  const response = await ctx.openAI.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: request ?? "What’s in this image?" },
          ...images.slice(0, 5).map((image) => {
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
