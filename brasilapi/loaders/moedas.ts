import { AppContext } from "../mod.ts";
import { CambioMoeda } from "../client.ts";

/**
 * @title Listar moedas para câmbio
 * @description Retorna a lista de moedas que podem ser usadas para consulta de câmbio
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<CambioMoeda[]> => {
  const response = await ctx.api["GET /cambio/v1/moedas"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar moedas: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
