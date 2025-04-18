import { getCookies } from "@std/http";
import { stringify } from "node:querystring";
import { AppContext } from "../../mod.ts";
import {
  CHECKOUT_DATA_ACCESS_COOKIE,
  VTEX_CHKO_AUTH,
} from "../../utils/cookies.ts";
import { VTEX_ID_CLIENT_COOKIE } from "../../utils/vtexId.ts";

interface Props {
  orderId: string;
}

/**
 * @title VTEX - Get User Order By Id
 * @description Should be used on order placed page and my account, the user must be authenticated or have access to the order through permissions or cookies
 */
export default async function loader(
  { orderId }: Props,
  req: Request,
  ctx: AppContext,
) {
  const { vcsDeprecated } = ctx;
  const cookies = Object.fromEntries(
    Object.entries(getCookies(req.headers)).filter(([key]) =>
      key.startsWith(VTEX_ID_CLIENT_COOKIE) ||
      // these two cookies are set by VTEX after order is placed on checkout and are
      // used to access the order placed page
      key.startsWith(CHECKOUT_DATA_ACCESS_COOKIE) ||
      key.startsWith(VTEX_CHKO_AUTH)
    ),
  );
  const cookie = stringify(cookies);

  const order = await vcsDeprecated["GET /api/oms/user/orders/:orderId"]({
    orderId,
  }, {
    headers: { cookie },
  }).then((res) => res.json());

  return order;
}
