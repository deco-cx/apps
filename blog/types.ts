import { ImageWidget } from "../admin/widgets.ts";
import { PageInfo, Person, Thing } from "../commerce/types.ts";
import { type Section } from "@deco/deco/blocks";
import { scheduledTime } from "./utils/date.ts";

/**
 * @titleBy name
 * @widget author
 */
export interface Author {
  name: string;
  email: string;
  /**
   * @title Type
   * @description Whether the author is a person or an organization. Emitted as the author @type in the JSON-LD. Defaults to Person.
   * @default Person
   */
  type?: "Person" | "Organization";
  avatar?: ImageWidget;
  jobTitle?: string;
  company?: string;
}

export interface Category {
  name: string;
  slug: string;
  description?: string;
  /**
   * @title Sections
   * @label hidden
   * @changeable true
   */
  sections?: Section[];
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
  /**
   * @title Modified date
   * @format date
   * @description Date of the last relevant content update. Emitted as dateModified in the JSON-LD.
   */
  dateModified?: string;
  slug: string;
  /**
   * @title Status
   * @description Publication status. Anything other than `published` is kept out of listings and never indexed. Posts with no status are treated as published.
   */
  status?: PostStatus;
  /**
   * @title Scheduled publication date
   * @format datetime
   * @description Instant this post goes live, honoured only while status is `scheduled`. Deliberately separate from the editorial date shown and sorted on: the two may diverge.
   */
  scheduledDatetime?: string;
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

/**
 * Publication status of a post. `published` (or an absent value, for legacy
 * posts) renders on the live site; `scheduled` renders once its
 * `scheduledDatetime` has passed; every other value keeps the post out of
 * listings and out of the index.
 *
 * `generating` and `awaiting_review` are written by the autonomous-blog agent
 * while a post is still being produced, which is why the checks below are
 * allowlists: a status this app does not recognize is a post the CMS does not
 * consider ready, so it must not leak into a listing.
 */
export type PostStatus =
  | "draft"
  | "published"
  | "scheduled"
  | "archived"
  | "generating"
  | "awaiting_review";

/**
 * A post is live when it has no status at all or is explicitly `published`.
 *
 * The absent case is load-bearing: `status` was added long after the first
 * posts were written, so every existing record is missing it. Requiring an
 * explicit `published` would empty every blog in production the moment a site
 * bumps this app.
 *
 * Takes a plain `string` so it can also be applied to a raw CMS record, where
 * the value is only a `PostStatus` by convention.
 */
export const isPublishedStatus = (status?: string): boolean =>
  !status || status === "published";

/**
 * Whether a post is live *right now* — the read-time half of scheduling.
 *
 * A scheduled post is merged to production ahead of its go-live instant, so
 * nothing rewrites the record when that instant arrives: this comparison is
 * what flips it, on whichever request first evaluates it after the fact.
 *
 * Like `isPublishedStatus`, this is an allowlist and stays one deliberately:
 * only an absent/empty status, an explicit `published`, or a `scheduled` post
 * whose instant has arrived is live. That makes every status added later — by
 * the CMS or by an agent — fail closed on an app version that predates it,
 * hiding the post instead of leaking a half-written one. A `status !== "draft"`
 * blacklist would lose that property permanently.
 */
export const isLivePost = (
  post: { status?: string; scheduledDatetime?: string },
  now: number = Date.now(),
): boolean => {
  if (isPublishedStatus(post.status)) {
    return true;
  }
  if (post.status !== "scheduled") {
    return false;
  }
  const goLive = post.scheduledDatetime
    ? scheduledTime(post.scheduledDatetime)
    : null;
  // A missing or unreadable instant is rejected rather than compared: this is
  // the fail-closed guarantee, not a redundant null check. `scheduledTime`
  // returns null (not 0) for a bad value precisely so that a real instant which
  // happens to be the epoch is still honoured here.
  return goLive !== null && goLive <= now;
};

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

/** @titleBy name */
export interface Publisher {
  name: string;
  /** @title Logo */
  logo?: ImageWidget;
  url?: string;
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
  /** @title Active category */
  category?: Category | null;
  /** @title Categories */
  categories?: Category[] | null;
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
