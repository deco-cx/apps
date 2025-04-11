import { AppContext } from "../mod.ts";
import { Corretora } from "../client.ts";

/**
 * @title Listar corretoras
 * @description Retorna as corretoras ativas listadas na CVM
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Corretora[]> => {
  const response = await ctx.api["GET /cvm/corretoras/v1"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar corretoras: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
