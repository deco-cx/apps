import { AppContext } from "../mod.ts";
import { City } from "../client.ts";

/**
 * @title Listar cidades CPTEC
 * @description Retorna todas as cidades disponíveis nos serviços do CPTEC/INPE
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<City[]> => {
  const response = await ctx.api["GET /cptec/v1/cidade"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar cidades: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
