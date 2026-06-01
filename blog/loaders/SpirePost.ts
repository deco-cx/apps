import type { SpireBlogPost } from "../types.ts";

// SpireBlogPost is defined in types.ts (NOT here) so Deco's schema generator
// treats it as a plain data type and renders inline form fields.
// When interfaces are defined in loader files they are treated as resolvable
// block types, which causes the Studio to show a chip instead of inline fields.

export interface Props {
  post: SpireBlogPost;
}

/**
 * @title Spire Post (managed by Spire AI)
 * @description Blog post managed by Spire AI. Title, excerpt, and SEO can
 *   be overridden here and will be synced back to Spire automatically.
 *   Image, authors, categories, date, and slug are managed by Spire (read-only).
 */
export default function SpirePostLoader({ post }: Props): SpireBlogPost {
  return post;
}
