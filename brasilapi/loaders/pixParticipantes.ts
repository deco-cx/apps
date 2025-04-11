import { AppContext } from "../mod.ts";
import { PIX_PARTICIPANTES } from "../client.ts";

/**
 * @title Listar participantes do PIX
 * @description Retorna informações de todos os participantes do PIX no Brasil
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<PIX_PARTICIPANTES[]> => {
  const response = await ctx.api["GET /pix/v1/participants"]({});

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar participantes do PIX: ${response.statusText}`,
    );
  }

  const result = await response.json();
  return result;
};

export default loader;
