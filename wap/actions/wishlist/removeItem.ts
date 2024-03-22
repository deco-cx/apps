import { AppContext } from "../../mod.ts";
import wishlistLoader from "../../loaders/wishlist.ts";

export interface Props {
  idProduto: number;
  idAtributoSimples: number;
  idUnidadeVenda: number;
  quantidade?: number;
  parametroAdicional?: string;
}

/**
 * @title Wap Integration
 * @description Wishlist remove item action
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<number[] | null> => {
  const { api } = ctx;

  const _response = await api
    ["POST /api/v2/front/wishlist/remove"]({}, {
      headers: req.headers,
      body: props,
    });

  return wishlistLoader(undefined, req, ctx);
};

export default loader;
