import { AppContext } from "../mod.ts";
import { MercadoSecundarioTituloPublico } from "../client.ts";

interface Props {
  /**
   * @title Data
   * @description Data no formato AAAA-MM-DD (opcional)
   */
  data?: string;
}

/**
 * @title Mercado Secundário Títulos Públicos
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MercadoSecundarioTituloPublico[]> => {
  const response = await ctx.api["GET /feed/precos-indices/v1/titulos-publicos/mercado-secundario-TPF"]({
    ...(props.data ? { data: props.data } : {}),
  });
  return await response.json();
};

export default loader; 