import type { AppContext } from "../mod.ts";
import type { User } from "../client.ts";

/**
 * @name Informações do Usuário 
 * @title Informacoes do Usuario
 * @description Obtém informações do usuário autenticado na SuperFrete
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<User> => {
  const response = await ctx.api["GET /api/v0/user"]({});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro ao buscar informações do usuário: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  return result;
};

export default loader;
