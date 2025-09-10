import { getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { buildCookieJar, proxySetCookie } from "../../utils/cookies.ts";
import type { CreateEditSessionResponse } from "../../utils/openapi/vcs.openapi.gen.ts";
// import { parseCookie } from "../../utils/vtexId.ts";
import { items } from "../../utils/session.ts";
// import { setSegmentBag } from "../../utils/segment.ts";

interface Props {
  publicProperties: Record<string, { value: string }>;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateEditSessionResponse> {
  const { vcs } = ctx;
  // const { cookie } = parseCookie(req.headers, ctx.account); ERRADO NAO REPASSA OS COOKIES CERTOS DE SESSION E SEGMENT
  const setCookiesSoFar = getSetCookies(ctx.response.headers);
  const { header: cookieHeader } = buildCookieJar(req.headers, setCookiesSoFar);
  // console.log("editSession cookieHeader", cookieHeader);

  const response = await vcs["PATCH /api/sessions"](
    { items: items.join(",") },
    {
      body: {
        public: {
          ...props.publicProperties,
        },
      },
      headers: { cookie: cookieHeader },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to edit session: ${response.status}`);
  }
  proxySetCookie(response.headers, ctx.response.headers, req.url);

  // const upstreamSetCookies = getSetCookies(response.headers);
  // const { record } = buildCookieJar(req.headers, upstreamSetCookies);
  // console.log("editSession cookiesResponse", record);
  // setSegmentBag(record, req, ctx);

  return await response.json();
}

export default action;
