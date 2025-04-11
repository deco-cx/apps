import { AppContext } from "../mod.ts";
import { Taxa } from "../client.ts";

interface Props {
  /**
   * @title Sigla da Taxa
   * @description Sigla da taxa de juros ou índice (ex: SELIC, CDI, IPCA)
   */
  sigla: string;
}

/**
 * @title Buscar taxa por sigla
 * @description Busca informações de uma taxa de juros ou índice específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Taxa> => {
  const { sigla } = props;

  const response = await ctx.api["GET /taxas/v1/:sigla"]({
    sigla: sigla.toUpperCase(),
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar taxa: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
