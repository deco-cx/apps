import { CreateEmailOptions } from "./types.ts";

export interface EmailJSApi {
  "POST /email/send": {
    body: CreateEmailOptions;
  };
}
