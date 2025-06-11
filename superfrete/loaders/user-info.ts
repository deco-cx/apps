import type { AppContext } from "../mod.ts";
import type { User } from "../client.ts";

/**
 * @name Get User Information
 * @title Get User Information
 * @description Gets information from the authenticated user in SuperFrete
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
