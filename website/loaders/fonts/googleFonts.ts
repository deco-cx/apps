import { fetchSafe } from "../../../utils/fetch.ts";
import { Font } from "../../components/Theme.tsx";
import type { Manifest } from "../../manifest.gen.ts";
import { hashStringSync } from "../../../utils/shortHash.ts";

interface Props {
  fonts: GoogleFont[];
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: unknown) => {
  const url = new URL(req.url);

  const params = new URLSearchParams([
    [
      "googlefontsloader",
      encodeURIComponent(hashStringSync(JSON.stringify(props.fonts))),
    ],
  ]);
  url.pathname = "";
  url.search = params.toString();
  return url.href;
};

/**
 * @title {{weight}} {{#italic}}Italic{{/italic}}{{^italic}}{{/italic}}
 */
interface FontVariation {
  weight: "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  italic?: boolean;
}

/** @titleBy family */
interface GoogleFont {
  family: string;
  variations: FontVariation[];
}

const ASSET_LOADER_PATH =
  "/live/invoke/website/loaders/asset.ts" satisfies `/live/invoke/${keyof Manifest[
    "loaders"
  ]}`;

const getFontVariations = (variations: FontVariation[]) => {
  if (variations.length === 0) {
    return "";
  }

  let hasItalic = false;
  // We check if any of the variations are italic and set the hasItalic flag
  // while we are sorting the variations by weight.
  const sortedVariations = variations
    .sort((a, b) => {
      a.italic ??= false;
      b.italic ??= false;

      if (a.italic !== b.italic) {
        hasItalic = true;

        if (a.italic) return 1;
        if (!a.italic) return -1;
      }

      return parseInt(a.weight) - parseInt(b.weight);
    })
    .filter((item, index, self) =>
      // The user can add both italic and non-italic variations for the same weight
      // So we need to make sure we only add the weight once.
      index === self.findIndex((t) => (
        t.weight === item.weight && t.italic === item.italic
      ))
    );

  const variants = [];

  for (const { weight, italic } of sortedVariations) {
    if (!hasItalic) {
      variants.push(weight);
      continue;
    }

    variants.push(`${italic ? "1," : "0,"}${weight}`);
  }

  return `:${hasItalic ? "ital," : ""}wght@${variants.join(";")}`;
};

const NEW_BROWSER_KEY = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
};

const OLD_BROWSER_KEY = {
  "User-Agent": "deco-cx/1.0",
};

const loader = async (props: Props, _req: Request): Promise<Font> => {
  const { fonts = [] } = props;
  const url = new URL("https://fonts.googleapis.com/css2?display=swap");

  const reduced = fonts.reduce((acc, font) => {
    const { family, variations } = font;

    acc[family] = acc[family] ?? { family, variations: [] };

    acc[family].variations = [
      ...acc[family].variations,
      ...variations,
    ];

    return acc;
  }, {} as Record<string, GoogleFont>);

  for (const font of Object.values(reduced)) {
    url.searchParams.append(
      "family",
      `${font.family}${getFontVariations(font.variations)}`,
    );
  }

  const sheets = await Promise.all([
    fetchSafe(url, { headers: OLD_BROWSER_KEY }).then((res) => res.text()),
    fetchSafe(url, { headers: NEW_BROWSER_KEY }).then((res) => res.text()),
  ]);

  const styleSheet = sheets.join("\n").replaceAll(
    "https://",
    `${ASSET_LOADER_PATH}?src=https://`,
  );
  return {
    family: Object.keys(reduced).join(", "),
    styleSheet,
  };
};

export default loader;
