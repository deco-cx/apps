import { ImageWidget } from "../admin/widgets.ts";
import { PageInfo, Person, Thing } from "../commerce/types.ts";

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
  authors: Author[];
  /**
   * @widget blog
   * @collection categories
   */
  categories: Category[];
  /**
   * @format date
   */
  date: string;
  slug: string;
  /**
   * @title Post Content
   * @format rich-text
   */
  content: string;
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
  /** Author of the */
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
  /** @description desktop otimized image */
  desktop: BannerItem;
  /** @description mobile otimized image */
  mobile: BannerItem;
  /** @description Image's alt text */
  alt: string;
  action?: {
    /** @description when user clicks on the image, go to this link */
    href: string;
  };
}
