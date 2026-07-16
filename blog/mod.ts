import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
import type { Publisher } from "./types.ts";
export type State = {
  /**
   * @title Category Slug
   * @description The slug of the Categories of the blogposts. Use :category
   * @example /blog/:category
   */
  categorySlug?: string;
  /**
   * @title Page Slug
   * @description The slug of the BlogPostPage to embed. Use :category and :slug.
   * @example /blog/:category/:slug
   */
  pageSlug?: string;
  /**
   * @title Canonical Base URL
   * @description Overrides the origin of the url/mainEntityOfPage emitted in the JSON-LD by the SEO sections, which otherwise use the request host.
   * @example https://www.mysite.com
   */
  canonicalBaseUrl?: string;
  /**
   * @title Publisher
   * @description Emitted as the publisher of the blog posts in the JSON-LD.
   */
  publisher?: Publisher;
};
export type AppContext = FnContext<State, Manifest>;
/**
 * @title Deco Blog
 * @description Manage your posts.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  return { manifest, state };
}
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Blog",
      owner: "deco.cx",
      description: "Manage your posts, categories and authors.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
      images: [],
      tabs: [],
    },
  };
};
