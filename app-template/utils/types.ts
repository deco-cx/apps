// notice that here we have the types for the return of the API calls
// you can use https://quicktype.io/ to convert JSON to typescript

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
}
