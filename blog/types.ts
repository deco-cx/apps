import { ImageWidget } from "../admin/widgets.ts";
import { PageInfo, Person, Thing } from "../commerce/types.ts";
import { type Section } from "@deco/deco/blocks";

/**
 * @titleBy name
 * @widget author
 */
export interface Author {
  name: string;
  email: string;
  avatar?: ImageWidget;
  jobTitle?: string;
  company?: string;
}

export interface Category {
  name: string;
  slug: string;
}

export interface BlogPost {
  /** @hide true */
  spirePostId?: string;
  title: string;
  excerpt: string;
  /**
   * @title Main image
   */
  image?: ImageWidget;
  /**
   * @title Alt text for the image
   */
  alt?: string;
  /**
   * @widget blog
   * @collection authors
   */
  authors?: Author[];
  /**
   * @widget blog
   * @collection categories
   */
  categories?: Category[];
  /**
   * @format date
   */
  date: string;
  slug: string;
  /**
   * @title Post Content
   * @format rich-text
   */
  content?: string;
  /**
   * @title Sections
   * @label hidden
   * @changeable true
   */
  sections?: Section[];
  /**
   * @title Carousel in post content
   * @description add a carousel in the middle of the post. Must be implemented in frontEnd
   */
  imageCarousel?: ImageCarousel;
  /**
   * @title SEO
   */
  seo?: Seo;
  /**
   * @title ReadTime in minutes
   */
  readTime?: number;
  /**
   * @title Extra Props
   */
  extraProps?: ExtraProps[];
  /** @hide true */
  aggregateRating?: AggregateRating;
  /** @hide true */
  review?: Review[];
  /** @hide true */
  contentRating?: Rating[];
  /** @hide true */
  interactionStatistic?: InteractionCounter;
  id?: string;
}

export interface ExtraProps {
  key: string;
  value: string;
}

export interface Seo {
  title?: string;
  description?: string;
  image?: ImageWidget;
  canonical?: string;
  noIndexing?: boolean;
}

/**
 * Studio form type for blog posts managed by Spire AI.
 *
 * Editable   (synced back to Spire via file watcher): title, excerpt, seo.
 * Read-only  (@readOnly — visible, input disabled): image, alt, authors,
 *            categories, date, slug.
 * Hidden     (@hide true — not shown in form): content, spirePostId, id.
 */
export interface SpireBlogPost {
  /**
   * @title Title
   * @description Edit here — changes are synced back to Spire automatically.
   */
  title: string;

  /**
   * @title Excerpt
   * @description Edit here — changes are synced back to Spire automatically.
   */
  excerpt: string;

  /**
   * @title SEO
   * @description Override SEO metadata. Changes sync back to Spire.
   */
  seo?: Seo;

  /**
   * @title Featured Image
   * @description Managed by Spire AI. Edit at spire.blog to change.
   * @readOnly
   */
  image?: ImageWidget;

  /** @readOnly */
  alt?: string;

  /**
   * @title Authors
   * @description Managed by Spire AI.
   * @readOnly
   */
  authors?: Author[];

  /**
   * @title Categories / Tags
   * @description Managed by Spire AI.
   * @readOnly
   */
  categories?: Category[];

  /**
   * @title Publication Date
   * @format date
   * @readOnly
   */
  date?: string;

  /**
   * @title URL Slug
   * @readOnly
   */
  slug?: string;

  /** @hide true */
  content?: string;

  /** @hide true */
  spirePostId?: string;

  /** @hide true */
  id?: string;
}

export interface BlogPostPage {
  "@type": "BlogPostPage";
  post: BlogPost;
  seo?: Seo | null;
}

export type SortBy =
  | "date_desc"
  | "date_asc"
  | "title_asc"
  | "title_desc"
  | "view_asc"
  | "view_desc";

export interface BlogPostListingPage {
  posts: BlogPost[];
  pageInfo: PageInfo;
  seo: Seo;
}

export interface ImageCarousel {
  banners?: Banner[];
  description?: string;
}

export interface Review {
  "@type": "Review";
  id?: string;
  /** The author of this review. */
  author?: Person;
  /** The date that the review was published, in ISO 8601 date format.*/
  datePublished?: string;
  /** The date that the review was modified, in ISO 8601 date format.*/
  dateModified?: string;
  /** The item that is being reviewed/rated. */
  itemReviewed?: string;
  /** Emphasis part of the review */
  reviewHeadline?: string;
  /** The actual body of the review. */
  reviewBody?: string;
  /** Review status */
  additionalType?: string;
  /** Anonymous comment. Not in Schema.org */
  isAnonymous?: boolean;
}

export interface Rating {
  "@type": "Rating";
  id?: string;
  /** The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably. */
  author?: Person;
  /** The item that is being reviewed/rated. */
  itemReviewed?: string;
  /** The highest value allowed in this rating system. */
  bestRating?: number;
  /** The lowest value allowed in this rating system. */
  worstRating?: number;
  /** 	A short explanation (e.g. one to two sentences) providing background context and other information that led to the conclusion expressed in the rating. This is particularly applicable to ratings associated with "fact check" markup using ClaimReview. */
  ratingValue?: number;
  /** Review status */
  additionalType?: string;
}

export interface AggregateRating {
  "@type": "AggregateRating";
  /** The count of total number of ratings. */
  ratingCount?: number;
  /** The count of total number of reviews. */
  reviewCount?: number;
  /** The rating for the content. */
  ratingValue?: number;
  /** The highest value allowed in this rating system. */
  bestRating?: number;
  /** The lowest value allowed in this rating system. */
  worstRating?: number;
}

export interface InteractionCounter extends Omit<Thing, "@type"> {
  "@type": "InteractionCounter";
  /** The number of interactions or views */
  userInteractionCount?: number;
}

export interface ViewFromDatabase {
  id: string;
  userInteractionCount?: number;
}

export interface Ignore {
  /**
   * @title Active
   */
  active?: boolean;
  /**
   * @title When additionalType is marked with:
   */
  markedAs?: string[];
}

export interface BannerItem {
  image?: ImageWidget;
  width?: number;
  height?: number;
}

export interface Banner {
  /** @description desktop optimized image */
  desktop: BannerItem;
  /** @description mobile optimized image */
  mobile: BannerItem;
  /** @description Image's alt text */
  alt: string;
  action?: {
    /** @description when user clicks on the image, go to this link */
    href: string;
  };
}
