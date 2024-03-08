import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../../utils/cookie.ts";
import { Cart } from "../../utils/type.ts";

export interface Props {
  tipo: "produto" | "lista";
  idProduto: number;
  idAtributoSimples: number;
  idUnidadeVenda: number;
  idArmazem: number;
  adicional?: string;
}

/**
 * @title Wap Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { api } = ctx;

  const response = await api
    ["DELETE /api/v2/front/checkout/cart"]({}, {
      body: props,
      headers: req.headers,
    });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json() as Promise<Cart>;
};

export default loader;
