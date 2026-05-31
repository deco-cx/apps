import type { BlogPost } from "../types.ts";
import type { ImageWidget } from "../../admin/widgets.ts";

// ---------------------------------------------------------------------------
// Field categorization — derived from BlogPost keys, stays in sync
// ---------------------------------------------------------------------------

/**
 * Fields owned exclusively by Spire AI.
 * Completely hidden from the Studio form (`@hide true`).
 * Any Studio edits to these fields are overwritten on the next Spire sync.
 */
type SpireHiddenKeys =
  | "content"
  | "sections"
  | "imageCarousel"
  | "spirePostId"
  | "id"
  | "readTime"
  | "extraProps"
  | "aggregateRating"
  | "review"
  | "contentRating"
  | "interactionStatistic";

/**
 * Fields editable in Studio.
 * Changes are synced back to Spire automatically via `sync-manual`.
 */
type SpireEditableKeys = "title" | "excerpt" | "seo";

// ---------------------------------------------------------------------------
// SpireBlogPost — Studio-facing shape for Spire-managed posts
// ---------------------------------------------------------------------------

/**
 * Studio form type for blog posts managed by Spire AI.
 *
 * Derives all field types from `BlogPost` via `Pick<BlogPost, ...>` and
 * `BlogPost[key]` so this interface stays in sync if `BlogPost` changes.
 *
 * Field categories and their Studio behaviour:
 *
 * | Category   | Fields                                   | Behaviour in Studio           |
 * |------------|------------------------------------------|-------------------------------|
 * | Editable   | `title`, `excerpt`, `seo`                | Normal input — synced to Spire |
 * | Read-only  | `image`, `authors`, `categories`, etc.   | Visible but locked (`@readOnly`) |
 * | Hidden     | `content`, `spirePostId`, `id`, etc.     | Not rendered (`@hide true`)    |
 *
 * TypeScript `readonly` is used alongside `@readOnly` for compile-time
 * safety: code that accesses a `SpireBlogPost` cannot mutate locked fields.
 */
interface SpireBlogPost extends Pick<BlogPost, SpireEditableKeys> {
  // ── Read-only fields (visible, locked) ──────────────────────────────────

  /**
   * @title Featured Image
   * @readOnly
   * @description Managed by Spire AI. Edit at spire.blog to change.
   */
  readonly image?: ImageWidget;

  /**
   * @readOnly
   */
  readonly alt?: string;

  /**
   * @title Authors
   * @readOnly
   * @description Managed by Spire AI.
   */
  readonly authors?: BlogPost["authors"];

  /**
   * @title Categories / Tags
   * @readOnly
   * @description Managed by Spire AI.
   */
  readonly categories?: BlogPost["categories"];

  /**
   * @title Publication Date
   * @format date
   * @readOnly
   */
  readonly date: string;

  /**
   * @title URL Slug
   * @readOnly
   * @description Edit at spire.blog to change the post URL.
   */
  readonly slug: string;

  // ── Hidden fields (not rendered in Studio) ───────────────────────────────

  /**
   * @hide true
   */
  content?: string;

  /**
   * @hide true
   */
  spirePostId?: string;

  /**
   * @hide true
   */
  id?: string;
}

/**
 * @title Spire Post (managed by Spire AI)
 * @description Blog post managed by Spire AI. Content, image, authors, and
 *   tags are owned by Spire — edit them at https://spire.blog. Title,
 *   excerpt, and SEO can be overridden here; changes are synced back to
 *   Spire automatically when saved in Studio.
 */
const loader = ({ post }: { post: SpireBlogPost }): BlogPost =>
  // SpireBlogPost is a view type for the Studio form. The underlying data IS
  // a BlogPost at runtime; the cast is safe.
  post as unknown as BlogPost;

export default loader;
