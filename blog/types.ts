export interface Author {
  name: string;
  email: string;
}

export interface BlogPost {
  title: string;
  subtitle: string;
  author: Author;
  date: Date;
  slug: string;
  content: string;
}