import { AppContext } from "../mod.ts";
import { Taxa } from "../client.ts";

/**
 * @title Taxas de juros e índices
 * @description Retorna as taxas de juros e alguns índices financeiros do Brasil
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Taxa[]> => {
  const response = await ctx.api["GET /taxas/v1"]({});

  if (!response.ok) {
    throw new Error(`Erro ao buscar taxas: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
