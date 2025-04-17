import { AppContext } from "../mod.ts";
import { CambioRetorno } from "../client.ts";

interface Props {
  /**
   * @title Moeda
   * @description Símbolo da moeda (USD, EUR, GBP, etc.)
   */
  moeda: string;

  /**
   * @title Data
   * @description Data da cotação (YYYY-MM-DD)
   */
  data: string;
}

/**
 * @title Cotação de câmbio
 * @description Busca cotação de câmbio de uma moeda em relação ao Real em uma data específica
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CambioRetorno> => {
  const { moeda, data } = props;

  // Verifica formato da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error("Formato de data inválido. Use YYYY-MM-DD");
  }

  const response = await ctx.api["GET /cambio/v1/cotacao/:moeda/:data"]({
    moeda: moeda.toUpperCase(),
    data,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar cotação: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
