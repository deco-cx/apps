import { fetchSafe } from "../../../utils/fetch.ts";
import { Font } from "../../components/Theme.tsx";
import type { Manifest } from "../../manifest.gen.ts";

interface Props {
  fonts: GoogleFont[];
}

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

const getFontVariation = ({ italic, weight }: FontVariation) =>
  `${italic ? "1" : "0"},${weight}`;

const getFontVariations = (variations: FontVariation[]) => {
  if (variations.length === 0) {
    return "";
  }

  return `,wght@${
    variations.map(getFontVariation)
      .join(";")
  }`;
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
      `${font.family}:ital${getFontVariations(font.variations)}`,
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
