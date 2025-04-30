import { AppContext } from "../mod.ts";
import { State } from "../client.ts";

/**
 * @title Listar estados brasileiros
 * @description Retorna informações de todos os estados do Brasil
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<State[]> => {
  const response = await ctx.api["GET /ibge/uf/v1"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar estados: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
