import { getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { buildCookieJar, setCookiesFromSession } from "../../utils/cookies.ts";
import { defaultItems } from "../../utils/session.ts";
import { Session, SessionProps } from "../../utils/types.ts";

/**
 * @title Create Session
 * @description Create a new session
 */
async function action(
  {
    publicProperties,
    items,
  }: SessionProps,
  req: Request,
  ctx: AppContext,
): Promise<Session> {
  const { vcs } = ctx;
  const setCookiesSoFar = getSetCookies(ctx.response.headers);
  const { header: cookie } = buildCookieJar(req.headers, setCookiesSoFar);

  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.search);
  searchParams.set("items", items?.join(",") || defaultItems);

  const response = await vcs["POST /api/sessions"](
    Object.fromEntries(searchParams.entries()),
    {
      body: {
        public: {
          ...publicProperties,
        },
      },
      headers: { cookie },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }

  setCookiesFromSession({
    from: response.headers,
    req,
    ctx,
  });

  return await response.json() as Session;
}

export default action;
