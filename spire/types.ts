// Blog-compatible types are imported directly from the blog app.
export type {
  AggregateRating,
  Author,
  BlogPost,
  BlogPostListingPage,
  BlogPostPage,
  Category,
  ExtraProps,
  InteractionCounter,
  Rating,
  Review,
  Seo,
  SortBy,
} from "../blog/types.ts";

// ---------------------------------------------------------------------------
// Spire API raw types
// ---------------------------------------------------------------------------

export interface SpireBrandColor {
  hex: string;
  name: string;
}

export interface SpireBlogProfile {
  companyName: string;
  logoUrl: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
  fontCode: string | null;
  brandColors: SpireBrandColor[];
  colorScheme: string;
  colorAccent: string;
  colorBackground: string;
  colorTextPrimary: string;
  colorTextSecondary: string | null;
  borderRadius: string;
}

export interface SpireBlog {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: string;
  profile: SpireBlogProfile;
}

export interface SpireAuthor {
  name: string;
  slug: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface SpirePostVersion {
  title: string;
  description: string;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  blocks: Block[];
}

export interface SpirePost {
  id: string;
  slug: string;
  publishedAt: string | null;
  version: SpirePostVersion;
  authors: SpireAuthor[];
  tags: string[];
}

export interface SpirePostSummary {
  id: string;
  slug: string;
  publishedAt: string | null;
  title: string;
  description: string;
  imageUrl: string;
}

export interface SpirePagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Spire content blocks
// ---------------------------------------------------------------------------

export interface ParagraphBlock {
  type: "paragraph";
  content: { html: string };
  position: number;
}

export interface ListBlock {
  type: "list";
  content: { items: string; style: "ordered" | "unordered" };
  position: number;
}

export interface HeadingBlock {
  type: "heading";
  content: { text: string; level: "1" | "2" | "3" | "4" | "5" | "6" };
  position: number;
}

export interface DividerBlock {
  type: "divider";
  content: Record<string, string>;
  position: number;
}

export interface QuoteBlock {
  type: "quote";
  content: {
    quote?: string;
    text?: string;
    attribution?: string;
    source?: string;
  };
  position: number;
}

export interface CalloutBlock {
  type: "callout";
  content: {
    body: string;
    title: string;
    variant: "info" | "tip" | "warning" | "danger";
  };
  position: number;
}

export interface CardGroupBlock {
  type: "card-group";
  /** JSON-encoded array of { icon, title, body } objects */
  content: { cards: string };
  position: number;
}

export interface ChecklistBlock {
  type: "checklist";
  /** items is a JSON-encoded string[] */
  content: { items: string; title: string };
  position: number;
}

export interface StepsBlock {
  type: "steps";
  /** steps is a JSON-encoded array of { title, description? } objects */
  content: { steps: string; title?: string };
  position: number;
}

export interface StatBlock {
  type: "stat";
  content: { value: string; label?: string; description?: string };
  position: number;
}

export interface StatGroupBlock {
  type: "stat-group";
  /** stats is a JSON-encoded array of { value, label } objects */
  content: { stats: string };
  position: number;
}

export interface ComparisonBlock {
  type: "comparison";
  /** left/right are JSON-encoded { title, items[] } objects */
  content: { left: string; right: string };
  position: number;
}

export interface ImageBlock {
  type: "image";
  content: {
    url: string;
    alt?: string;
    caption?: string;
    size?: "full" | "normal";
  };
  position: number;
}

export interface VideoBlock {
  type: "video";
  content: { url: string; caption?: string };
  position: number;
}

export interface CodeBlock {
  type: "code";
  content: { code: string; language?: string; filename?: string };
  position: number;
}

export interface CtaBlock {
  type: "cta";
  content: { text: string; href?: string };
  position: number;
}

export interface SystemBlock {
  type?: never;
  system_block_id: string;
  content: Record<string, string>;
  position: number;
}

export interface CustomBlock {
  type?: never;
  custom_block_id: string;
  content: Record<string, string>;
  position: number;
}

export type Block =
  | ParagraphBlock
  | ListBlock
  | HeadingBlock
  | DividerBlock
  | QuoteBlock
  | CalloutBlock
  | CardGroupBlock
  | ChecklistBlock
  | StepsBlock
  | StatBlock
  | StatGroupBlock
  | ComparisonBlock
  | ImageBlock
  | VideoBlock
  | CodeBlock
  | CtaBlock
  | SystemBlock
  | CustomBlock;
