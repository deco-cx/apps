import { AppContext } from "../mod.ts";
import { Bank } from "../client.ts";

/**
 * @title Listar todos os bancos
 * @description Retorna informações de todos os bancos do Brasil
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Bank[]> => {
  const response = await ctx.api["GET /banks/v1"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar bancos: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
