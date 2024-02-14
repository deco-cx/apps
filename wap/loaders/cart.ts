import { AppContext } from "../mod.ts";
import { proxySetCookie } from "../../utils/cookie.ts";
import { Cart } from "../utils/type.ts";

/**
 * @title Wap Integration
 * @description Product Cart loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { api } = ctx;

  const response = await api
    ["GET /api/v2/front/checkout/cart"]({}, {
      headers: req.headers,
    });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json() as Promise<Cart>;
};

export default loader;
