import type { ImageWidget } from "../../admin/widgets.ts";
import { Author } from "./Author.ts";
export interface BlogPost {
  title: string;
  subtitle: string;
  image?: ImageWidget;
  /**
   * @options blog/loaders/AuthorOptions.ts
   */
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
