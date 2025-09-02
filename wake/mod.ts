import { Markdown } from "../decohub/components/Markdown.tsx";
import { fetchSafe } from "../utils/fetch.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { CheckoutApi } from "./utils/client.ts";
import { OpenAPI } from "./utils/openapi/wake.openapi.gen.ts";
import { type App, context, type FnContext } from "@deco/deco";
export type AppContext = FnContext<State, Manifest>;
export let state: null | State = null;

// Track app initialization calls to skip logging on first call (manifest generation)
let appCallCount = 0;

/** @title Wake */
export interface Props {
  /**
   * @title Account Name
   * @description erploja2 etc
   */
  account: string;
  /**
   * @title Checkout Url
   * @description https://checkout.erploja2.com.br
   */
  checkoutUrl: string;
  /**
   * @title Wake Storefront Token
   * @description https://wakecommerce.readme.io/docs/storefront-api-criacao-e-autenticacao-do-token
   */
  storefrontToken: Secret;
  /**
   * @title Wake API token
   * @description The token for accessing wake commerce
   */
  token?: Secret;
  /**
   * @description Use Wake as backend platform
   * @hide true
   */
  platform: "wake";
}
export interface State extends Props {
  api: ReturnType<typeof createHttpClient<OpenAPI>>;
  checkoutApi: ReturnType<typeof createHttpClient<CheckoutApi>>;
  storefront: ReturnType<typeof createGraphqlClient>;
}
export const color = 0xB600EE;
/**
 * @title Wake
 * @description Loaders, actions and workflows for adding Wake Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/wake/logo.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, storefrontToken, account, checkoutUrl } = props;

  // Increment call counter
  appCallCount++;

  // Check if we're in development mode using Deco's context
  const isDev = !context.isDeploy;

  // Resolve token values first
  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";
  const stringStorefrontToken = typeof storefrontToken === "string"
    ? storefrontToken
    : storefrontToken?.get?.() ?? "";

  // Only log on the second call and beyond (skip first call during manifest generation)
  if (appCallCount > 1) {
    if (!stringToken || !stringStorefrontToken) {
      const message =
        "Missing Wake API tokens. Add them in the Wake app config in deco.cx admin. Some functionalities may not work.";
      console.warn(message);

      if (isDev) {
        console.error(`
🚨 Wake API Configuration Missing 🚨

You are running in development mode without Wake API tokens configured.

To fix this:
1. Create a .env file in your project root
2. Add the following environment variables:
   - WAKE_TOKEN=your_storefront_token_here
   - WAKE_KEY=your_api_token_here

For production:
1. Go to deco.cx admin
2. Find the Wake app in your site configuration
3. Set up secrets for Storefront Token and API Token

Without these tokens, product loading and e-commerce features will fail with authentication errors.

For help: https://wakecommerce.readme.io/docs/storefront-api-criacao-e-autenticacao-do-token
        `);
      }
    } else if (isDev) {
      console.info("✅ Wake API tokens configured successfully");
    }
  }
  const api = createHttpClient<OpenAPI>({
    base: "https://api.fbits.net",
    headers: new Headers({ "Authorization": `Basic ${stringToken}` }),
    fetcher: fetchSafe,
  });
  //22e714b360b7ef187fe4bdb93385dd0a85686e2a
  const storefront = createGraphqlClient({
    endpoint: "https://storefront-api.fbits.net/graphql",
    headers: new Headers({ "TCS-Access-Token": `${stringStorefrontToken}` }),
    fetcher: fetchSafe,
  });
  const checkoutApi = createHttpClient<CheckoutApi>({
    base: checkoutUrl ?? `https://${account}.checkout.fbits.store`,
    fetcher: fetchSafe,
  });
  state = { ...props, api, storefront, checkoutApi };
  return {
    state,
    manifest,
  };
}
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "Wake",
      owner: "deco.cx",
      description:
        "Loaders, actions and workflows for adding Wake Commerce Platform to your website.",
      logo: "https://raw.githubusercontent.com/deco-cx/apps/main/wake/logo.png",
      images: [
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/6ffea061-09f2-4063-a1f0-8ad2a37a148d/Screenshot-2024-09-05-at-12.57.10.png",
      ],
      tabs: [
        {
          title: "About",
          content: markdownContent(),
        },
      ],
    },
  };
};
