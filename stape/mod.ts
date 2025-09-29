import type { App as DecoApp, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { StapeClient } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Stape Container URL
   * @description Your Stape container URL (e.g., https://your-container.stape.io)
   * @placeholder https://your-container.stape.io
   */
  containerUrl: string;

  /**
   * @title API Key
   * @description Your Stape API key from account settings
   */
  apiKey?: Secret;

  /**
   * @title GTM Container ID
   * @description Your Google Tag Manager Container ID (e.g., GTM-XXXXXXX)
   * @placeholder GTM-XXXXXXX
   */
  gtmContainerId?: string;

  /**
   * @title Enable GDPR Compliance
   * @description Only send events if user has given consent
   * @default true
   */
  enableGdprCompliance?: boolean;

  /**
   * @title Cookie Consent Name
   * @description Name of the cookie that stores user consent
   * @default cookie_consent
   */
  consentCookieName?: string;
}

// Here we define the state of the app
export interface State extends Omit<Props, "apiKey"> {
  api: ReturnType<typeof createHttpClient<StapeClient>>;
  apiKey?: string;
}

/**
 * @title Stape Server-Side Tagging
 * @description Server-side tagging solution that bypasses ad blockers and ensures GDPR compliance. Track e-commerce events, page views, and custom events directly from your server to multiple advertising platforms.
 * @category Analytics
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/stape/logo.png
 */
export default function App(props: Props): DecoApp<Manifest, State> {
  const { apiKey, containerUrl: _containerUrl } = props;

  const stringApiKey = typeof apiKey === "string"
    ? apiKey
    : apiKey?.get?.() ?? "";

  const api = createHttpClient<StapeClient>({
    base: "https://api.app.stape.io",
    headers: new Headers({
      "Authorization": `Bearer ${stringApiKey}`,
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });

  const state: State = {
    ...props,
    apiKey: stringApiKey,
    api,
  };

  return {
    state,
    manifest,
  };
}

// It is important to use the same name as the default export of the app
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Stape Server-Side Tagging",
      owner: "deco.cx",
      description:
        "Stape server-side tagging integration for enhanced tracking and GDPR compliance. Enables sending events to Meta Ads, TikTok Ads, Google Ads, and other channels.",
      logo: "https://stape.io/favicon.ico",
      images: [],
      tabs: [],
    },
  };
};
