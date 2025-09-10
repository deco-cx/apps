import { getCookies, getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import type { CreateEditSessionResponse } from "../../utils/openapi/vcs.openapi.gen.ts";
import { items } from "../../utils/session.ts";

interface Props {
  publicProperties: Record<string, { value: string }>;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateEditSessionResponse> {
  const { vcs } = ctx;
  const cookies = getCookies(req.headers);
  console.log("createSession cookies", cookies);

  const response = await vcs["POST /api/sessions"]({
    items: items.join(","),
  }, {
    body: {
      public: {
        ...props.publicProperties,
      },
    },
    headers: { cookie: req.headers.get("cookie") || "" },
  });

  const cookiesResponse = getCookies(response.headers);
  console.log("createSession cookiesResponse", cookiesResponse);
  const cookiesSet = getSetCookies(response.headers);
  console.log("createSession getSetCookies", cookiesSet);

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return await response.json();
}

export default action;
