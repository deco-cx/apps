import { AppContext } from "../mod.ts";
import { TabelaFIPE } from "../client.ts";

/**
 * @title Tabelas de referência FIPE
 * @description Lista as tabelas de referência existentes para consulta de preços de veículos
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<TabelaFIPE[]> => {
  const response = await ctx.api["GET /fipe/tabelas/v1"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar tabelas FIPE: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
