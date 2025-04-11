import { AppContext } from "../mod.ts";
import { NCM } from "../client.ts";

/**
 * @title Listar NCMs
 * @description Retorna informações de todos os NCMs (Nomenclatura Comum do Mercosul)
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<NCM[]> => {
  const response = await ctx.api["GET /ncm/v1"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar NCMs: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
