import { Secret } from "../../website/loaders/secret.ts";

export const getAuthValue = (key?: Secret) => 
  typeof key === "string" ? key : key?.get?.() ?? "";