import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../../utils/cookie.ts";
import { Cart } from "../../utils/type.ts";

export interface Props {
  tipo: "produto" | "lista";
  itens: Array<{
    idProduto: number;
    idAtributoSimples: number;
    idUnidadeVenda: number;
    idArmazem: number;
    quantidade: number;
    adicional?: string;
    parametros?: string;
  }>;
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

  const response = await api["POST /api/v2/front/checkout/cart"]({}, {
    body: props,
    headers: req.headers,
  });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json() as Promise<Cart>;
};

export default loader;
