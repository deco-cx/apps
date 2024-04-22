import "../website/utils/unhandledRejection.ts";

import {
  ExponentialBackoff,
  handleWhen,
  retry,
} from "https://esm.sh/cockatiel@3.1.1?target=es2019";
import { HttpError } from "./http.ts";
import { fetch } from "deco/runtime/fetch/mod.ts";

// this error is thrown by deno deploy when the connection is closed by the server.
// check the discussion at discord: https://discord.com/channels/985687648595243068/1107104244517048320/1107111259813466192
export const CONNECTION_CLOSED_MESSAGE =
  "connection closed before message completed";

const connectionClosedMsg = handleWhen((err: Error | null) => {
  const isConnectionClosed =
    err?.message?.includes(CONNECTION_CLOSED_MESSAGE) ?? false;

  if (isConnectionClosed) console.error("retrying...", err);

  return isConnectionClosed;
});

export const retryExceptionOr500 = retry(connectionClosedMsg, {
  maxAttempts: 1,
  backoff: new ExponentialBackoff(),
});

type CachingMode = "stale-while-revalidate";

type DecoInit = {
  cache: CachingMode;
  cacheTtlByStatus?: Array<{ from: number; to: number; ttl: number }>;
};

export type DecoRequestInit = RequestInit & { deco?: DecoInit };

export const fetchSafe = async (
  input: string | Request | URL,
  init?: DecoRequestInit,
) => {
  const response = await retryExceptionOr500.execute(() => fetch(input, init));

  if (response.ok) {
    return response;
  }

  throw new HttpError(response.status, `${await response.text()}`);
};

export const fetchAPI = async <T>(
  input: string | Request | URL,
  init?: DecoRequestInit,
): Promise<T> => {
  const headers = new Headers(init?.headers);

  headers.set("accept", "application/json");

  const response = await fetchSafe(input, { ...init, headers });

  return response.json();
};

export const STALE = {
  deco: { cache: "stale-while-revalidate" },
} as const;
