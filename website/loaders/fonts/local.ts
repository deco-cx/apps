import { Font } from "../../components/Theme.tsx";
import type { Manifest } from "../../manifest.gen.ts";
import type { FileWidget } from "../../../admin/widgets.ts";

interface Props {
  fonts: LocalFont[];
}

/**
 * @title {{weight}} {{#italic}}Italic{{/italic}}{{^italic}}{{/italic}}
 */
interface FontVariation {
  weight: "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  italic?: boolean;
  src: FileWidget;
}

const ASSET_LOADER_PATH =
  "/live/invoke/website/loaders/asset.ts" satisfies `/live/invoke/${keyof Manifest[
    "loaders"
  ]}`;

const getFontFormat = (src: string): string => {
  const clean = src.toLowerCase().split(/[?#]/, 1)[0];
  const extension = clean.slice(clean.lastIndexOf(".") + 1);
  switch (extension) {
    case "woff2":
      return "woff2";
    case "woff":
      return "woff";
    case "ttf":
      return "truetype";
    case "otf":
      return "opentype";
    case "eot":
      return "embedded-opentype";
    case "svg":
      return "svg";
    default:
      return "truetype"; // fallback
  }
};

/** @titleBy family */
interface LocalFont {
  family: string;
  variations: FontVariation[];
}

const loader = (props: Props): Font => {
  const { fonts = [] } = props;

  const reduced = fonts.reduce((acc, font) => {
    const { family, variations } = font;

    acc[family] = acc[family] ?? { family, variations: [] };

    acc[family].variations = [
      ...acc[family].variations,
      ...variations,
    ];

    return acc;
  }, {} as Record<string, LocalFont>);

  const fontFaces = [];

  for (const font of Object.values(reduced)) {
    for (const variation of font.variations) {
      const { weight, italic = false, src } = variation;
      const fontStyle = italic ? "italic" : "normal";
      const format = getFontFormat(src);

      const fontFace = `@font-face {
  font-family: '${font.family}';
  font-style: ${fontStyle};
  font-weight: ${weight};
  font-display: swap;
  src: url(${ASSET_LOADER_PATH}?src=${
        encodeURIComponent(src)
      }) format('${format}');
}`;

      fontFaces.push(fontFace);
    }
  }

  const styleSheet = fontFaces.join("\n");

  return {
    family: Object.keys(reduced).join(", "),
    styleSheet,
  };
};

export default loader;
