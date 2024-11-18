import { GithubUser } from "./types.ts";

export interface ClientInterfaceExample {
  "GET /users/:username": {
    response: GithubUser;
  };
  "POST /users/:username": {
    response: GithubUser;
    body: {
      filter: string;
    };
  };
}
