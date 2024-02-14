import { App } from "deco/mod.ts";
import shopify, { Props as ShopifyProps } from "../shopify/mod.ts";
import vnda, { Props as VNDAProps } from "../vnda/mod.ts";
import vtex, { Props as VTEXProps } from "../vtex/mod.ts";
import wake, { Props as WakeProps } from "../wake/mod.ts";
import wap, { Props as WapProps } from "../wap/mod.ts";
import website, { Props as WebsiteProps } from "../website/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { bgYellow } from "std/fmt/colors.ts";

type CustomPlatform = {
  platform: "other";
};

export type Props = WebsiteProps & {
  /** @deprecated Use selected commerce instead */
  commerce?:
    | VNDAProps
    | VTEXProps
    | ShopifyProps
    | WakeProps
    | WapProps
    | CustomPlatform;
};

type WebsiteApp = ReturnType<typeof website>;
type CommerceApp =
  | ReturnType<typeof vnda>
  | ReturnType<typeof vtex>
  | ReturnType<typeof wake>
  | ReturnType<typeof wap>
  | ReturnType<typeof shopify>;

export default function Site(
  state: Props,
): App<Manifest, Props, [WebsiteApp] | [WebsiteApp, CommerceApp]> {
  const { commerce } = state;

  const site = website(state);

  if (commerce && commerce.platform !== "other") {
    console.warn(
      bgYellow("Deprecated"),
      "Commerce prop is now deprecated. Delete this prop and install the commerce platform app instead. This will be removed in the future",
    );
  }

  const ecommerce = commerce?.platform === "vnda"
    ? vnda(commerce)
    : commerce?.platform === "vtex"
    ? vtex(commerce)
    : commerce?.platform === "wake"
    ? wake(commerce)
    : commerce?.platform === "shopify"
    ? shopify(commerce)
    : commerce?.platform === "wap"
    ? wap(commerce)
    : null;

  return {
    state,
    manifest: {
      ...manifest,
      sections: {
        ...manifest.sections,
        "commerce/sections/Seo/SeoPDP.tsx": {
          ...manifest.sections["commerce/sections/Seo/SeoPDP.tsx"],
          default: (props) =>
            manifest.sections["commerce/sections/Seo/SeoPDP.tsx"].default({
              ...state.seo,
              ...props,
            }),
        },
        "commerce/sections/Seo/SeoPLP.tsx": {
          ...manifest.sections["commerce/sections/Seo/SeoPLP.tsx"],
          default: (props) =>
            manifest.sections["commerce/sections/Seo/SeoPLP.tsx"].default({
              ...state.seo,
              ...props,
            }),
        },
      },
    },
    dependencies: ecommerce ? [site, ecommerce] : [site],
  };
}

export { onBeforeResolveProps } from "../website/mod.ts";
