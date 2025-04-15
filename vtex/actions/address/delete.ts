import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  addressId: string;
}

async function action({ addressId }: Props, req: Request, ctx: AppContext) {
  const { vcs } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  return await vcs["DELETE /api/dataentities/:acronym/documents/:id"]({
    acronym: "AD",
    id: addressId,
  }, { headers: { cookie, accept: "application/json" } });
}

export const defaultVisibility = "private";
export default action;
