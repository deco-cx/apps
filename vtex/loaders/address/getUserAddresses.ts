import type { PostalAddress } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { toPostalAddress } from "../../utils/transform.ts";
import type { Address } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<PostalAddress[] | null> {
  const { vcs } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  try {
    const addresses = await vcs["GET /api/dataentities/:acronym/search"]({
      acronym: "AD",
      _where: `userId=${payload.userId}`,
      _fields:
        "addressName,addressType,city,complement,country,geoCoordinate,neighborhood,number,postalCode,receiverName,reference,state,street,userId",
    }, { headers: { cookie } }).then((r) => r.json()) as Omit<
      Address,
      "isDisposable"
    >[];

    if (!addresses?.length) {
      return null;
    }

    return addresses.map(toPostalAddress);
  } catch (_) {
    return null;
  }
}

export const defaultVisibility = "private";
export default loader;
