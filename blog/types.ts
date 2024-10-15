import { ImageWidget } from "../admin/widgets.ts";
import { ImageObject, PageInfo, Thing } from "../commerce/types.ts";
//Vira about
export interface Category {
  name: string;
  slug: string;
}

/**
 * @titleBy name
 * @widget author
 * https://schema.org/author
 */
export type Author = Person | Organization;

//TODO: Comments (https://schema.org/Comment) and aggreggate rating (https://schema.org/AggregateRating)
export interface BlogPosting extends Omit<Thing, "@type" | "description"> {
  "@type": "BlogPosting";
  /** @description Headline of the article. */
  headline: string;
  /**
   * @description Date of first publication or broadcast, in ISO 8601 date format (Chapter 5.4).
   */
  datePublished: string;
  /**
   * @description The date on which the article was most recently modified, in ISO 8601 date format (Chapter 5.4).
   */
  dateModified: string;
  /** The author of this content */
  author: Author;
  /**
   * An abstract is a short description that summarizes the article.
   */
  abstract: string;
  /**
   * The actual body of the article.
   * @format rich-text
   */
  articleBody: string;
  /**
   * The subject matter of the content.
   * @description Put categories here
   */
  about?: Array<About>;
  /** Keywords or tags used to describe some item. */
  keywords?: Array<string>;
  /** The number of words in the text of the Article. */
  wordCount?: number;
  /** Conditions that affect the availability of, or method(s) of access to, an item. */
  conditionsOfAccess?: string;
  /** Approximate or typical time it usually takes to work with or through the content of this work for the typical or target audience. */
  timeRequired?: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
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
  | "title_desc";

export interface BlogPostListingPage {
  posts: BlogPost[];
  pageInfo: PageInfo;
  seo: Seo;
}

/** https://schema.org/Person */
export interface Person extends Omit<Thing, "@type"> {
  "@type": "Person";
  /** Email address. */
  email?: string;
  /** Gender of something, typically a Person, but possibly also fictional characters, animals, etc */
  gender?: "https://schema.org/Male" | "https://schema.org/Female";
  /** An image of the item. This can be a URL or a fully described ImageObject. **/
  image?: ImageObject[];
  /** The job title of the person (for example, Financial Manager). */
  jobTitle?: string;
  /** To indicate a topic that is known about - suggesting possible expertise but not implying it. */
  knowsAbout?: Omit<Thing, "@type">;
  /** Organizations that the person works for. */
  worksFor?: Organization;
}

/** https://schema.org/Organization */
export interface Organization extends Omit<Thing, "@type"> {
  "@type": "Organization";
  /** Email address. */
  email?: string;
}

export interface About extends Omit<Thing, "@type"> {
  "@type": "About";
}
