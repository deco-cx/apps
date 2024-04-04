import type {
  App as A,
  AppContext as AC,
  AppMiddlewareContext as AMC,
  ManifestOf,
} from "deco/mod.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { createHttpClient } from "../utils/http.ts";
import workflow from "../workflows/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { middleware } from "./middleware.ts";
import { SP, VTEXCommerceStable } from "./utils/client.ts";
import { fetchSafe } from "./utils/fetchVTEX.ts";
import { OpenAPI as VCS } from "./utils/openapi/vcs.openapi.gen.ts";
import { OpenAPI as API } from "./utils/openapi/api.openapi.gen.ts";
import { OpenAPI as MY } from "./utils/openapi/my.openapi.gen.ts";
import { Segment } from "./utils/types.ts";
import type { Secret } from "../website/loaders/secret.ts";

export type App = ReturnType<typeof VTEX>;
export type AppContext = AC<App>;
export type AppManifest = ManifestOf<App>;
export type AppMiddlewareContext = AMC<App>;

export type SegmentCulture = Omit<
  Partial<Segment>,
  | "utm_medium"
  | "utm_campaign"
  | "utm_source"
  | "utmi_campaign"
  | "utmi_part"
  | "utmi_page"
  | "campaigns"
  | "priceTables"
  | "regionId"
>;
/** @title VTEX */
export interface Props {
  /**
   * @description VTEX Account name. For more info, read here: https://help.vtex.com/en/tutorial/o-que-e-account-name--i0mIGLcg3QyEy8OCicEoC.
   */
  account: string;

  /**
   * @title Public store URL
   * @description Domain that is registered on License Manager (e.g: www.mystore.com.br)
   */
  publicUrl: string;

  /**
   * @title App Key
   * @description Only required for extra features
   */
  appKey?: Secret;

  /**
   * @title App Token
   * @description Only required for extra features
   * @format password
   */
  appToken?: Secret;

  /**
   * @title Default Sales Channel
   * @description (Use defaultSegment instead)
   * @default 1
   * @deprecated
   */
  salesChannel?: string;

  /**
   * @title Default Segment
   */
  defaultSegment?: SegmentCulture;

  usePortalSitemap?: boolean;

  /**
   * @description Use VTEX as backend platform
   */
  platform: "vtex";
}

export const color = 0xf71963;

/**
 * @title VTEX
 * @description Loaders, actions and workflows for adding VTEX Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/vtex/logo.png
 */
export default function VTEX({
  appKey,
  appToken,
  account,
  publicUrl,
  salesChannel,
  ...props
}: Props) {
  const headers = new Headers();

  appKey &&
    headers.set(
      "X-VTEX-API-AppKey",
      typeof appKey === "string" ? appKey : appKey?.get?.() ?? "",
    );
  appToken &&
    headers.set(
      "X-VTEX-API-AppToken",
      typeof appToken === "string" ? appToken : appToken?.get?.() ?? "",
    );

  const sp = createHttpClient<SP>({
    base: `https://sp.vtex.com`,
    fetcher: fetchSafe,
  });
  const my = createHttpClient<MY>({
    base: `https://${account}.myvtex.com/`,
    fetcher: fetchSafe,
  });
  const vcsDeprecated = createHttpClient<VTEXCommerceStable>({
    base: `https://${account}.vtexcommercestable.com.br`,
    fetcher: fetchSafe,
  });
  const io = createGraphqlClient({
    endpoint:
      `https://${account}.vtexcommercestable.com.br/api/io/_v/private/graphql/v1`,
    fetcher: fetchSafe,
  });
  const vcs = createHttpClient<VCS>({
    base: `https://${account}.vtexcommercestable.com.br`,
    fetcher: fetchSafe,
    headers: headers,
  });
  const api = createHttpClient<API>({
    base: `https://api.vtex.com/${account}`,
    fetcher: fetchSafe,
    headers: headers,
  });

  const state = {
    ...props,
    salesChannel: salesChannel ?? "1",
    account,
    publicUrl,
    vcsDeprecated,
    sp,
    io,
    vcs,
    my,
    api,
  };

  const app: A<Manifest, typeof state, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    middleware,
    dependencies: [workflow({})],
  };

  return app;
}
