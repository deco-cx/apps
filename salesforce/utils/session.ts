import { getCookies } from "std/http/mod.ts";
import type { Session, TokenBaseSalesforce } from "./types.ts";
import { AppContext } from "../mod.ts";
import { convertSecondsToDate } from "./utils.ts";

export const SESSION_COOKIE_NAME = "salesforce_session";

export const SESSION = Symbol("session");

export const getSession = (ctx: AppContext): Session => ctx.bag?.get(SESSION);

export const setSession = (
  ctx: AppContext,
  session: Session,
) => {
  ctx.bag?.set(SESSION, session);
};

/**
 * Stable serialization.
 *
 * This means that even if the attributes are in a different order, the final session
 * value will be the same. This improves cache hits
 */

export const parse = (cookie: string) => JSON.parse(atob(cookie));

export const serialize = ({
  token,
  basketId,
}: Session) =>
  btoa(JSON.stringify({
    token,
    basketId,
  }));

export const getSessionCookie = (req: Request): Session => {
  const cookies = getCookies(req.headers);
  const cookie = cookies[SESSION_COOKIE_NAME];
  const session = cookie && parse(cookie);
  return {
    ...session,
  };
};

export const getSessionHeaders = (
  session: Session,
  headers?: Headers,
) => {
  const h = new Headers(headers);
  h.set("Authorizathion", `Bearer ${session.token!}`);
  return h;
};

export const setSessionCookie = (
  session: Session,
  token: TokenBaseSalesforce,
  headers: Headers = new Headers(),
): Headers => {
  const {
    refresh_token,
    usid,
    refresh_token_expires_in,
    expires_in,
    id_token,
  } = token;

  const expireTokenDate = convertSecondsToDate(expires_in).toUTCString();
  const expireRefTokenDate = convertSecondsToDate(refresh_token_expires_in)
    .toUTCString();
  headers.set(
    "Set-Cookie",
    `salesforce_session=${
      serialize(session)
    }; Expires=${expireTokenDate}; Secure=true; HttpOnly:true`,
  );

  headers.append(
    "Set-Cookie",
    `${
      id_token ? "cc-nx" : "cc-nx-g"
    }_=${refresh_token}; Expires=${expireRefTokenDate}; Secure=true; HttpOnly:true`,
  );

  headers.append(
    "Set-Cookie",
    `usid_${SESSION_COOKIE_NAME}=${usid}; Secure=true; HttpOnly:true`,
  );

  return headers;
};
