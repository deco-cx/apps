import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  addressId: string;
}

async function action({ addressId }: Props, req: Request, ctx: AppContext) {
  const { vcs } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  try {
    return await vcs["DELETE /api/dataentities/:acronym/documents/:id"]({
      acronym: "AD",
      id: addressId,
    }, { headers: { cookie, accept: "application/json" } });
  } catch (error) {
    console.error("Error deleting address:", error);
    return null;
  }
}

export const defaultVisibility = "private";
export default action;
