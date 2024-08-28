import { ImageWidget } from "../admin/widgets.ts";
import { ImageObject, PageInfo, Thing } from "../commerce/types.ts";

/**
 * @titleBy name
 * @widget author
 * https://schema.org/author
 */
export type Author = Person | Organization;

//Vira about
export interface Category {
  name: string;
  slug: string;
}

export interface BlogPosting extends Omit<Thing, "@type">{
  "@type": "BlogPosting", 
}

export interface BlogPost {
  
  title: string;
  excerpt: string;
  image?: ImageWidget;
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
  /** Given name. In the U.S., the first name of a Person. */
  givenName?: string;
  /** Family name. In the U.S., the last name of a Person. */
  familyName?: string;
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
