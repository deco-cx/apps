import { Author } from "./Author.ts";

export interface BlogPost {
  title: string;
  subtitle: string;
  authors: Author[];
  date: Date;
  slug: string;
  content: string;
}

const loader = ({ post }: { post: BlogPost }): BlogPost => post;

export default loader;
