import { CreateEmailOptions } from "./types.ts";

export interface ResendApi {
  "POST /emails": {
    body: CreateEmailOptions;
  };
}
