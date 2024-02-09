// deno-lint-ignore-file no-explicit-any
export { onBeforeResolveProps } from "../../website/mod.ts";
import { ImportMap } from "deco/blocks/app.ts";
import { buildImportMap } from "deco/blocks/utils.tsx";
import type { App, AppContext as AC, AppManifest } from "deco/mod.ts";
import type { PickByValue } from "https://esm.sh/utility-types@3.10.0";
import $live, { Props as LiveProps } from "../$live/mod.ts";
import commerce, { Props as CommerceProps } from "../../commerce/mod.ts";
import type { Manifest as ShopifyManifest } from "../../shopify/manifest.gen.ts";
import shopify, { Props as ShopifyProps } from "../../shopify/mod.ts";
import type { Manifest as VNDAManifest } from "../../vnda/manifest.gen.ts";
import vnda, { Props as VNDAProps } from "../../vnda/mod.ts";
import type { Manifest as VTEXManifest } from "../../vtex/manifest.gen.ts";
import vtex, { Props as VTEXProps } from "../../vtex/mod.ts";

import type { Manifest as WebSiteManifest } from "../../website/manifest.gen.ts";
import type {
  ShopifyAccount,
  StdManifest,
  VNDAAccount,
  VTEXAccount,
} from "./deps.ts";
import type { Manifest as _Manifest } from "./manifest.gen.ts";

import manifest from "./manifest.gen.ts";

export type ManifestWithStdCompat =
  & Omit<StdManifest, "routes" | "islands">
  & _Manifest;

export type ManifestMappings = Partial<
  {
    [
      blockType in keyof Omit<
        StdManifest,
        "name" | "baseUrl" | "routes" | "islands"
      >
    ]: {
      [
        blockKey in
          & Exclude<
            (keyof Omit<
              StdManifest,
              "name" | "baseUrl" | "routes" | "islands"
            >[blockType]),
            blockType extends keyof _Manifest ? keyof _Manifest[blockType] : ""
          >
          & `deco-sites/std/${string}`
      ]: blockType extends
        keyof (ShopifyManifest & VNDAManifest & VTEXManifest & WebSiteManifest)
        ?
          | (keyof (
            & ShopifyManifest
            & VNDAManifest
            & VTEXManifest
            & WebSiteManifest
          )[blockType])
          | null
        : string;
    };
  }
>;
const NOT_IMPLEMENTED = null;
const manifestMappings = {
  functions: {
    // should we reimplement all of these? how about linx impulse?
    "deco-sites/std/functions/butterCMSAds.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSBrands.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSCategories.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSFeaturedPosts.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSPage.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSPlaces.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSPostDetail.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSPosts.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/butterCMSRelatedPosts.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/occProductDetailsPage.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/shopifyProductDetailsPage.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/shopifyProductList.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/shopifyProductListingPage.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/vndaProductList.ts": NOT_IMPLEMENTED,
    "deco-sites/std/functions/vndaProductListingPage.ts": NOT_IMPLEMENTED,
  },
  loaders: {
    "deco-sites/std/loaders/linxImpulse/autocompletes/popular.ts":
      NOT_IMPLEMENTED,
    "deco-sites/std/loaders/linxImpulse/autocompletes/suggestions.ts":
      NOT_IMPLEMENTED,
    "deco-sites/std/loaders/linxImpulse/pages/recommendations.ts":
      NOT_IMPLEMENTED,
    "deco-sites/std/loaders/linxImpulse/products/similarItems.ts":
      NOT_IMPLEMENTED,
    "deco-sites/std/loaders/linxImpulse/search.ts": NOT_IMPLEMENTED,
    "deco-sites/std/loaders/nuvemShop/nuvemShopProductDetailsPage.ts":
      NOT_IMPLEMENTED,
    "deco-sites/std/loaders/nuvemShop/nuvemShopProductList.ts": NOT_IMPLEMENTED,
    "deco-sites/std/loaders/nuvemShop/nuvemShopProductListingPage.ts":
      NOT_IMPLEMENTED,
    "deco-sites/std/loaders/vnda/cart.ts": "vnda/loaders/cart.ts",
    "deco-sites/std/loaders/vnda/productDetailsPage.ts":
      "vnda/loaders/productDetailsPage.ts",
    "deco-sites/std/loaders/vnda/productList.ts": "vnda/loaders/productList.ts",
    "deco-sites/std/loaders/vnda/productListingPage.ts":
      "vnda/loaders/productListingPage.ts",
    "deco-sites/std/loaders/vnda/proxy.ts": "vnda/loaders/proxy.ts",
    "deco-sites/std/loaders/vtex/cart.ts": "vtex/loaders/cart.ts",
    "deco-sites/std/loaders/vtex/user.ts": "vtex/loaders/user.ts",
    "deco-sites/std/loaders/vtex/wishlist.ts": "vtex/loaders/wishlist.ts",
    "deco-sites/std/loaders/x/image.ts": "website/loaders/image.ts",
    "deco-sites/std/loaders/x/redirectsFromCsv.ts":
      "website/loaders/redirectsFromCsv.ts",
  },
  sections: {
    // Global sections are now deprecated
    "deco-sites/std/sections/configButterCMS.global.tsx": NOT_IMPLEMENTED,
    "deco-sites/std/sections/configLinxImpulse.global.tsx": NOT_IMPLEMENTED,
    "deco-sites/std/sections/configNuvemShop.tsx": NOT_IMPLEMENTED,
    "deco-sites/std/sections/configOCC.global.tsx": NOT_IMPLEMENTED,
    "deco-sites/std/sections/configShopify.global.tsx": NOT_IMPLEMENTED,
    "deco-sites/std/sections/configVTEX.global.tsx": NOT_IMPLEMENTED,
    "deco-sites/std/sections/configYourViews.global.tsx": NOT_IMPLEMENTED,

    "deco-sites/std/sections/SEO.tsx": "website/sections/Seo/Seo.tsx",
  },
  actions: {
    "deco-sites/std/actions/vnda/cart/addItem.ts":
      "vnda/actions/cart/addItem.ts",
    "deco-sites/std/actions/vnda/cart/setShippingAddress.ts": NOT_IMPLEMENTED,
    "deco-sites/std/actions/vnda/cart/updateCoupon.ts": NOT_IMPLEMENTED,
    "deco-sites/std/actions/vnda/cart/updateItem.ts":
      "vnda/actions/cart/updateItem.ts",
    "deco-sites/std/actions/vtex/analytics/sendEvent.ts":
      "vtex/actions/analytics/sendEvent.ts",
    "deco-sites/std/actions/vtex/cart/addItems.ts":
      "vtex/actions/cart/addItems.ts",
    "deco-sites/std/actions/vtex/cart/getInstallment.ts":
      "vtex/actions/cart/getInstallment.ts",
    "deco-sites/std/actions/vtex/cart/removeItemAttachment.ts":
      "vtex/actions/cart/removeItemAttachment.ts",
    "deco-sites/std/actions/vtex/cart/removeItems.ts":
      "vtex/actions/cart/removeItems.ts",
    "deco-sites/std/actions/vtex/cart/simulation.ts":
      "vtex/actions/cart/simulation.ts",
    "deco-sites/std/actions/vtex/cart/updateAttachment.ts":
      "vtex/actions/cart/updateAttachment.ts",
    "deco-sites/std/actions/vtex/cart/updateCoupons.ts":
      "vtex/actions/cart/updateCoupons.ts",
    "deco-sites/std/actions/vtex/cart/updateItemAttachment.ts":
      "vtex/actions/cart/updateItemAttachment.ts",
    "deco-sites/std/actions/vtex/cart/updateItemPrice.ts":
      "vtex/actions/cart/updateItemPrice.ts",
    "deco-sites/std/actions/vtex/cart/updateItems.ts":
      "vtex/actions/cart/updateItems.ts",
    "deco-sites/std/actions/vtex/cart/updateProfile.ts":
      "vtex/actions/cart/updateProfile.ts",
    "deco-sites/std/actions/vtex/cart/updateUser.ts":
      "vtex/actions/cart/updateUser.ts",
    "deco-sites/std/actions/vtex/newsletter/subscribe.ts":
      "vtex/actions/newsletter/subscribe.ts",
    "deco-sites/std/actions/vtex/notifyme.ts": "vtex/actions/notifyme.ts",
    "deco-sites/std/actions/vtex/wishlist/addItem.ts":
      "vtex/actions/wishlist/addItem.ts",
    "deco-sites/std/actions/vtex/wishlist/removeItem.ts":
      "vtex/actions/wishlist/removeItem.ts",
  },
} satisfies ManifestMappings;

type Mappings = typeof manifestMappings;
type Manifest = {
  [key in keyof ManifestWithStdCompat]: key extends keyof Mappings ? {
      [
        blockKey in keyof Omit<
          ManifestWithStdCompat[key],
          keyof PickByValue<Mappings[key], null>
        >
      ]: Omit<
        ManifestWithStdCompat[key],
        keyof PickByValue<Mappings[key], null>
      >[blockKey];
    }
    : ManifestWithStdCompat[key];
};

type AvailableCommerceProps = CommerceProps["commerce"];

const isVTEXProps = (props: AvailableCommerceProps): props is VTEXProps => {
  return (props as VTEXProps)?.platform === "vtex";
};

const isShopifyProps = (
  props: AvailableCommerceProps,
): props is ShopifyProps => {
  return (props as ShopifyProps)?.platform === "shopify";
};

const isVNDAProps = (props: AvailableCommerceProps): props is VNDAProps => {
  return (props as VNDAProps)?.platform === "vnda";
};
export type State = {
  configVTEX?: VTEXAccount;
  configShopify?: ShopifyAccount;
  configVNDA?: VNDAAccount;
} & AvailableCommerceProps;

export type Props = CommerceProps;

export function WithoutCommerce(
  props: LiveProps,
): App<
  Manifest,
  LiveProps,
  [ReturnType<typeof $live>]
> {
  const targetApps: Record<
    string,
    { manifest: AppManifest; importMap: ImportMap }
  > = {};

  const liveApp = $live(props);
  const { resolvables: _ignoreResolvables, ...webSiteApp } =
    liveApp.dependencies![0];
  const importMap: ImportMap = {
    ...buildImportMap(manifest),
  };
  targetApps["website"] = {
    importMap: buildImportMap(webSiteApp.manifest),
    manifest: webSiteApp.manifest,
  };
  const _manifest = { ...manifest };
  for (const [_blockKey, blockMappings] of Object.entries(manifestMappings)) {
    const blockKey = _blockKey as keyof _Manifest;
    _manifest[blockKey] = { ...(manifest as any)[blockKey] ?? {} };
    for (const [from, to] of Object.entries(blockMappings)) {
      if (to === null) {
        importMap.imports[from] = `data:text/javascript,;`; // ignore
        continue;
      }
      for (
        const [target, { importMap: appImportMap, manifest: appManifest }]
          of Object.entries(targetApps)
      ) {
        if (to?.startsWith(target)) {
          // @ts-ignore: blockkeys and from/to always exists for those types
          _manifest[blockKey][from] = appManifest[blockKey][to];
          importMap.imports[from] = appImportMap.imports[to];
          break;
        }
      }
    }
  }

  return {
    state: props,
    importMap,
    manifest: _manifest as Manifest,
    dependencies: [liveApp],
  };
}

export type VTEXContext = AC<
  App<
    Manifest,
    State,
    [ReturnType<typeof $live>, ReturnType<typeof vtex>]
  >
>;

export type AppContext = AC<ReturnType<typeof Std>>;
export default function Std(
  props: CommerceProps,
): App<
  Manifest,
  State,
  [ReturnType<typeof $live>, ReturnType<typeof commerce>]
> {
  const targetApps: Record<
    string,
    { manifest: AppManifest; importMap: ImportMap }
  > = {};

  if (!props.commerce) {
    throw new Error(
      "Missing commerce props. Please migrate to apps before removing commerce prop",
    );
  }

  const commerceApp = commerce(
    props,
  );
  let state: State = { ...props.commerce };
  if (isVTEXProps(props.commerce)) {
    state.configVTEX = {
      defaultLocale: "pt-BR",
      defaultPriceCurrency: "BRL",
      defaultSalesChannel: "1",
      ...props.commerce,
    };
    const { manifest, state: appState } = vtex(props.commerce);
    state = { ...state, ...appState };
    targetApps["vtex"] = {
      importMap: buildImportMap(manifest),
      manifest,
    };
  }

  if (isShopifyProps(props.commerce)) {
    state.configShopify = props.commerce;
    const { manifest, state: appState } = shopify(props.commerce);
    state = { ...state, ...appState };

    targetApps["shopify"] = {
      importMap: buildImportMap(manifest),
      manifest,
    };
  }

  if (isVNDAProps(props.commerce)) {
    state.configVNDA = {
      domain: props.commerce.publicUrl,
      internalDomain: `${props.commerce.account}.cdn.vnda.com.br`,
      useSandbox: props.commerce.sandbox,
      authToken: typeof props.commerce.authToken === "string"
        ? props.commerce.authToken
        : props.commerce.authToken?.get?.() ?? "",
      defaultPriceCurrency: "BRL",
    };
    const { manifest, state: appState } = vnda(props.commerce);
    state = { ...state, ...appState };

    targetApps["vnda"] = {
      importMap: buildImportMap(manifest),
      manifest,
    };
  }
  const liveApp = $live(props);
  const { resolvables: _ignoreResolvables, ...webSiteApp } =
    liveApp.dependencies![0];
  const importMap: ImportMap = {
    ...buildImportMap(manifest),
  };
  targetApps["website"] = {
    importMap: buildImportMap(webSiteApp.manifest),
    manifest: webSiteApp.manifest,
  };
  const _manifest = { ...manifest };
  for (const [_blockKey, blockMappings] of Object.entries(manifestMappings)) {
    const blockKey = _blockKey as keyof _Manifest;
    _manifest[blockKey] = { ...(manifest as any)[blockKey] ?? {} };
    for (const [from, to] of Object.entries(blockMappings)) {
      if (to === null) {
        importMap.imports[from] = `data:text/javascript,;`; // ignore
        continue;
      }
      for (
        const [target, { importMap: appImportMap, manifest: appManifest }]
          of Object.entries(targetApps)
      ) {
        if (to?.startsWith(target)) {
          // @ts-ignore: blockkeys and from/to always exists for those types
          _manifest[blockKey][from] = appManifest[blockKey][to];
          importMap.imports[from] = appImportMap.imports[to];
          break;
        }
      }
    }
  }

  const [, ecomPlatform] = commerceApp.dependencies ?? [];

  return {
    state,
    importMap,
    manifest: _manifest as Manifest,
    dependencies: [liveApp, {
      ...commerceApp,
      dependencies: ecomPlatform ? [webSiteApp, ecomPlatform] : [webSiteApp],
    }],
  };
}
