import type { ImageWidget } from "../../admin/widgets.ts";

/**
 * @format dynamic-options
 * @options blog/loaders/AuthorOptions.ts
 */
export type Author = string;

export interface BlogPost {
  title: string;
  subtitle: string;
  image?: ImageWidget;
  authors: Author[];
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

const loader = ({ post }: { post: BlogPost }): BlogPost => post;

export default loader;
