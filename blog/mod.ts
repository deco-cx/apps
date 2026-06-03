import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";

export type State = {
  /**
   * @title Page Slug
   * @description The slug of the BlogPostPage to embed. Use :category and :slug.
   */
  pageSlug?: string;
  /**
   * @title Spire Blog Slug
   * @description Slug of the Spire blog to sync (e.g. "my-company"). Must match
   *   the spireBlogSlug configured in autonomous-blog settings.
   */
  spireBlogSlug?: string;
};

export type AppContext = FnContext<State, Manifest>;

/**
 * @title Deco Blog
 * @description Manage your blog posts, categories and authors.
 *   Supports native block-based posts and Spire AI-generated posts
 *   rendered as Deco sections (paragraph, heading, list, code, etc.).
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/blog/logo.png
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
      description:
        "Manage your posts, categories and authors. Supports native Deco posts and Spire AI-generated posts rendered as native Deco sections.",
      logo: "https://raw.githubusercontent.com/deco-cx/apps/main/blog/logo.png",
      images: [],
      tabs: [],
    },
  };
};
