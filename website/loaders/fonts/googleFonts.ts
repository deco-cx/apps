import { fetchSafe, STALE } from "../../../utils/fetch.ts";
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

const loader = async (props: Props, req: Request): Promise<Font> => {
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
      `${font.family}:ital,wght@${
        font.variations.map(({ italic, weight }) =>
          `${italic ? "1" : "0"},${weight}`
        ).join(";")
      }`,
    );
  }

  const styleSheet = await fetchSafe(url, {
    ...STALE,
    headers: req.headers,
  }).then((res) => res.text());

  return {
    family: Object.keys(reduced).join(", "),
    styleSheet: styleSheet.replace(
      "https://",
      `${ASSET_LOADER_PATH}?src=https://`,
    ),
  };
};

export default loader;
