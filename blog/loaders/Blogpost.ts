import { Author } from "./Author.ts";
import type { ImageWidget } from "../../admin/widgets.ts";

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
   * @title Content
   * @format html
   */
  content: string;
}

const loader = ({ post }: { post: BlogPost }): BlogPost => post;

export default loader;
