import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { ClientOf } from "../utils/http.ts";
import { SpireApi } from "./utils/client.ts";
import { type App as A, type AppContext as AC, Resolved } from "@deco/deco";
import { type Section } from "@deco/deco/blocks";

export type App = ReturnType<typeof Spire>;
export type AppContext = AC<App>;

const BASE_URL = "https://spire.blog/api";

export type BlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "divider"
  | "quote"
  | "callout"
  | "product-card"
  | "product-shelf"
  | "product-highlight"
  | "checklist"
  | "steps"
  | "stat"
  | "stat-group"
  | "card-group"
  | "comparison"
  | "image"
  | "video"
  | "code"
  | "cta";

export interface SectionOverride {
  /**
   * @title Block type key
   * @description The Spire block type to override
   */
  key: BlockType;
  /**
   * @title Section
   * @description The section that will be rendered in place of the default block component
   */
  value: Resolved<Section>;
}

export interface Props {
  /**
   * @title Account slug
   * @description The Spire blog account slug (e.g. "miess")
   */
  account: string;
  /**
   * @title Override Sections
   * @description Map block type keys to custom sections, replacing the default spire/sections/blocks/* components
   */
  overrideSections?: SectionOverride[];
}

interface State extends Props {
  api: ClientOf<SpireApi>;
  overrideMap: Record<string, Resolved<Section>>;
}

/**
 * @title Spire Blog
 * @description Fetch and display blog posts from Spire.
 * @category Tool
 * @logo https://spire.blog/favicon.ico
 */
export default function Spire({ account, overrideSections }: Props) {
  const api = createHttpClient<SpireApi>({
    base: BASE_URL,
    fetcher: fetchSafe,
  });

  const overrideMap = Object.fromEntries(
    (overrideSections ?? []).map(({ key, value }) => [key, value]),
  );

  const state: State = { account, api, overrideMap };

  const app: A<Manifest, State> = { manifest, state };

  return app;
}

export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Spire Blog",
      owner: "spire.blog",
      description: "Fetch and display blog posts powered by Spire.",
      logo: "https://spire.blog/favicon.ico",
      images: [],
      tabs: [],
    },
  };
};
