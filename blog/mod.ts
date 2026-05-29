import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
import { h } from "preact";
import { type ClientOf, createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { SpireApi } from "../spire/utils/client.ts";
import SpireSyncPreviewTab from "./components/SpireSyncPreviewTab.tsx";

/** Configurable by the site owner in Deco Studio settings. */
export type State = {
  /**
   * @title Page Slug
   * @description The slug of the BlogPostPage to embed. Use :category and :slug.
   */
  pageSlug?: string;
  /**
   * @title Spire Blog Slug
   * @description Your Spire blog account slug (e.g. "moleca").
   *   When set, blog loaders transparently merge native Deco posts with live Spire posts.
   *   Spire posts are fetched in real-time from the Spire API — no storage or sync required.
   */
  allowedBlogSlug?: string;
  /**
   * @title Spire Webhook Secret
   * @description Shared secret for verifying incoming webhooks from Spire (HMAC-SHA256).
   *   Generate one in Spire Settings → Deco Integration and paste the same value here.
   */
  spireWebhookSecret?: Secret;
  /**
   * @title Spire API URL
   * @description Override only when using a self-hosted Spire instance. Default: https://spire.blog
   */
  spireUrl?: string;
};

/** Internal state derived in App() — not user-configured. */
interface BlogState extends State {
  /** Typed Spire API HTTP client. Present only when allowedBlogSlug is set. */
  spireApi?: ClientOf<SpireApi>;
}

export type AppContext = FnContext<BlogState, Manifest>;

/**
 * @title Deco Blog
 * @description A blog app for Deco.cx. Supports native block-based posts and optional
 *   Spire AI integration: when a Spire Blog Slug is configured, live Spire posts are
 *   transparently merged with native Deco posts in all loaders.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(state: State): App<Manifest, BlogState> {
  const spireBase = (state.spireUrl ?? "https://spire.blog").replace(/\/$/, "");
  const spireApi = state.allowedBlogSlug
    ? createHttpClient<SpireApi>({
      base: `${spireBase}/api`,
      fetcher: fetchSafe,
    })
    : undefined;

  return { manifest, state: { ...state, spireApi } };
}

export const preview = (
  { state }: { manifest?: typeof manifest; state?: State } = {},
) => {
  const isConfigured = !!state?.allowedBlogSlug && !!(
    typeof state.spireWebhookSecret === "string"
      ? state.spireWebhookSecret
      : state.spireWebhookSecret?.get?.()
  );

  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Blog",
      owner: "deco.cx",
      description:
        "Native Deco blog with optional Spire AI integration. Set a Spire Blog Slug to include live AI-generated posts alongside your native content.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
      images: [],
      tabs: [
        {
          title: "Spire",
          content: h(SpireSyncPreviewTab, {
            isConfigured,
            blogSlug: state?.allowedBlogSlug,
          }),
        },
      ],
    },
  };
};
