import { DecoRequestInit } from "../../utils/fetch.ts";
import { retryExceptionOr500 } from "../../utils/fetch.ts";
import { HttpError } from "../../utils/http.ts";
import { ErrorResponse } from "../utils/types.ts";

export const fetchSafe = async (
  input: string | Request | URL,
  init?: DecoRequestInit,
) => {
  const response = await retryExceptionOr500.execute(() => fetch(input, init));

  if (response.ok) {
    return response;
  }

  const body = await response.json() as ErrorResponse;
  console.error(`Mailchimp API error: ${input}\n`, body);
  throw new HttpError(response.status, body.title);
};
