import { ImageWidget } from "../admin/widgets.ts";

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
}
export interface Seo {
  title: string;
  description: string;
  canonical: string;
  noIndexing?: boolean;
}

export interface BlogPostPage {
  "@type": "BlogPostPage";
  post: BlogPost;
  seo?: Seo | null;
}
