import { getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { buildCookieJar, proxySetCookie } from "../../utils/cookies.ts";
import type { GetSessionResponse } from "../../utils/openapi/vcs.openapi.gen.ts";
import { items } from "../../utils/session.ts";

interface Props {
  publicProperties: Record<string, { value: string }>;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<GetSessionResponse> {
  const { vcs } = ctx;
  const setCookiesSoFar = getSetCookies(ctx.response.headers);
  const { header: cookie } = buildCookieJar(req.headers, setCookiesSoFar);

  const response = await vcs["POST /api/sessions"]({
    items: items.join(","),
  }, {
    body: {
      public: {
        ...props.publicProperties,
      },
    },
    headers: { cookie },
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return await response.json() as GetSessionResponse;
}

export default action;
