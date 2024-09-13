import { Reaction } from "../types.ts";

export const VALID_SORT_ORDERS = ["asc", "desc"];

export const REACTIONS_MOCK: Reaction[] = [{
  person: {
    email: "test@test",
    name: "test",
  },
  datePublished: "2024-09-13T12:07:29.207Z",
  dateModified: "2024-09-13T12:07:46.120Z",
  action: "like",
}];
