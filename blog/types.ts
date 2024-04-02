export interface Author {
  name: string;
  email: string;
}

export interface BlogPost {
  title: string;
  subtitle: string;
  authors: {
    author: Author;
  }[];
  /** @format date */
  date: Date;
  slug: string;
  content: string;
}
