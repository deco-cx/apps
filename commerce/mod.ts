import { App } from "deco/mod.ts";
import shopify, { Props as ShopifyProps } from "../shopify/mod.ts";
import vnda, { Props as VNDAProps } from "../vnda/mod.ts";
import vtex, { Props as VTEXProps } from "../vtex/mod.ts";
import website, { Props as WebsiteProps } from "../website/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type Props = WebsiteProps & {
  commerce: VNDAProps | VTEXProps | ShopifyProps;
};

type WebsiteApp = ReturnType<typeof website>;
type CommerceApp =
  | ReturnType<typeof vnda>
  | ReturnType<typeof vtex>
  | ReturnType<typeof shopify>;

export default function Site(
  state: Props,
): App<Manifest, Props, [WebsiteApp, CommerceApp]> {
  const { commerce } = state;

  const site = website(state);
  const ecommerce = commerce.platform === "vnda"
    ? vnda(commerce)
    : commerce.platform === "vtex"
    ? vtex(commerce)
    : shopify(commerce);

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
    dependencies: [site, ecommerce],
  };
}

export { onBeforeResolveProps } from "../website/mod.ts";
