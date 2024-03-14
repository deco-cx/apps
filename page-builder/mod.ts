
import type { App, AppContext as AC } from "deco/mod.ts";
import colorthief from "npm:colorthief";
import manifest, { Manifest } from "./manifest.gen.ts";
import { RGBColor, Colors } from "./utils/types.ts"
import { findDissimilarColor, rgbToHex } from "./utils/colors.ts"

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
};

export interface State extends Props {
  colors: Colors
}

export let state: null | State = null;

/**
 * @title page-builder
 */
export default async function App(
  props: Props
): Promise<App<Manifest, State>> {
  const { domain, primary, secondary } = props;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const colors: Colors = {
    primary: {
      hex: primary ?? "#0d2017",
      rgb: [13, 32, 23]
    },
    secondary: {
      hex: secondary ?? "#0d2017",
      rgb: [13, 32, 23]
    }
  }
  try {
    const [primaryColorRGB, paletteRGB] = await Promise.all([
      colorthief.getColor(faviconUrl) as Promise<RGBColor>,
      colorthief.getPalette(faviconUrl) as Promise<RGBColor[]>,
    ]);

    if (!primaryColorRGB || !paletteRGB) {
      throw new Error("Failed to extract colors from image");  
     }

    const secondaryColorRGB = findDissimilarColor(primaryColorRGB, paletteRGB);

    colors.primary.rgb = primaryColorRGB;
    colors.primary.hex = rgbToHex(primaryColorRGB);
    colors.secondary.rgb = secondaryColorRGB;
    colors.secondary.hex = rgbToHex(secondaryColorRGB);
    props.primary = rgbToHex(primaryColorRGB);
    props.secondary = rgbToHex(secondaryColorRGB);


    }
    catch (error) { 
      console.error("Error in ColorsLoader:", error);
    }

    state = { 
      ...props,
      colors,
    }

    return { manifest, state };
}

export type AppContext = AC<Awaited<ReturnType<typeof App>>>;
