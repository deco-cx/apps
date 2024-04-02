import type { App, AppContext as AC } from "deco/mod.ts";
import colorthief from "npm:colorthief";
import vtex from "../vtex/mod.ts";
import type { LegacyProduct as LegacyProductVTEX } from "../vtex/utils/types.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { findDissimilarColor, rgbToHex } from "./utils/colors.ts";
import { Colors, RGBColor } from "./utils/types.ts";

export interface Props {
  /**
   * @description Put your web-site domain here.
   */
  domain: string;

  /**
   * @format color-input
   */
  primary?: string;

  /**
   * @format color-input
   */
  secondary?: string;
  fontFamily?:
    | "Roboto"
    | "Montserrat"
    | "Inter"
    | "Raleway"
    | "Lora"
    | "Comfortaa"
    | "Marcellus";
}

export interface State {
  colors: Colors;
  icon: string;
  fontFamily?:
    | "Roboto"
    | "Montserrat"
    | "Inter"
    | "Raleway"
    | "Lora"
    | "Comfortaa"
    | "Marcellus";
}

export let state: null | State = null;

/**
 * @title page-builder
 */
export default async function App(
  props: Props,
): Promise<App<Manifest, State>> {
  let { domain, primary, secondary, fontFamily } = props;
  domain = domain.replace("https://", "").replace("http://", "");

  let faviconUrl = `https://icon.horse/icon/${domain}`;

  try {
    const hasFavIcon = await colorthief.getColor(faviconUrl) as Promise<
      RGBColor
    >;

    if (!hasFavIcon) {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
  } catch (error) {
    console.error("Error fetching favicon:", error);
    faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  const vtexProductsUrl =
    `https://${domain}/api/catalog_system/pub/products/search?&_from=1&_to=1`;

  const colors: Colors = {
    primary: {
      hex: primary ?? "#0d2017",
      rgb: [13, 32, 23],
    },
    secondary: {
      hex: secondary ?? "#0d2017",
      rgb: [13, 32, 23],
    },
  };
  let vtexAccount = "bravtexfashionstore";

  try {
    const [primaryColorRGB, paletteRGB, products] = await Promise.allSettled([
      colorthief.getColor(faviconUrl) as Promise<RGBColor>,
      colorthief.getPalette(faviconUrl) as Promise<RGBColor[]>,
      fetch(vtexProductsUrl).then((res) => res.json()) as Promise<
        LegacyProductVTEX[]
      >,
    ]);

    if (
      primaryColorRGB.status === "rejected" || paletteRGB.status === "rejected"
    ) {
      throw new Error("Failed to extract colors from image");
    }

    const secondaryColorRGB = findDissimilarColor(
      primaryColorRGB.value,
      paletteRGB.value,
    );

    colors.primary.rgb = primaryColorRGB.value;
    colors.primary.hex = rgbToHex(primaryColorRGB.value);
    colors.secondary.rgb = secondaryColorRGB;
    colors.secondary.hex = rgbToHex(secondaryColorRGB);
    props.primary = rgbToHex(primaryColorRGB.value);
    props.secondary = rgbToHex(secondaryColorRGB);

    if (products.status === "rejected") {
      throw new Error("This site hasn't vtex");
    }

    const [product] = products.value;

    const url = product.items[0].images[0].imageUrl;
    const accountRegex = /https:\/\/(\w+)\./;
    const match = url.match(accountRegex);

    if (match && match[1]) {
      vtexAccount = match[1];
    }
  } catch (error) {
    console.error("Error in page-builder:", error);
  }

  state = {
    colors,
    icon: faviconUrl,
    fontFamily,
  };

  const eccomerce = vtex({
    salesChannel: "1",
    defaultSegment: { channelPrivacy: "public" },
    platform: "vtex",
    account: vtexAccount,
    publicUrl: `www.secure.${domain.split(".").slice(1).join(".")}`,
  });

  return { manifest, state, dependencies: [eccomerce] };
}

export type AppContext = AC<Awaited<ReturnType<typeof App>>>;
