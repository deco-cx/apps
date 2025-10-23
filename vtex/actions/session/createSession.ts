import type { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import type { CreateEditSessionResponse } from "../../utils/openapi/vcs.openapi.gen.ts";

interface Props {
  publicProperties: Record<string, { value: string }>;
}

/**
 * @title Create Session
 * @description Create a new session
 */
async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateEditSessionResponse> {
  const { vcs } = ctx;

  const response = await vcs["POST /api/sessions"]({}, {
    body: {
      public: {
        ...props.publicProperties,
      },
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return await response.json();
}

export default action;
