import type { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import type { CreateEditSessionResponse } from "../../utils/openapi/vcs.openapi.gen.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  publicProperties: Record<string, { value: string }>;
}

/**
 * @title Edit Session
 * @description Edit a session
 */
async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateEditSessionResponse> {
  const { vcs } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const response = await vcs["PATCH /api/sessions"]({}, {
    body: {
      public: {
        ...props.publicProperties,
      },
    },
    headers: { cookie },
  });

  if (!response.ok) {
    throw new Error(`Failed to edit session: ${response.status}`);
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return await response.json();
}

export default action;
