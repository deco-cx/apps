import type { AppContext } from "../mod.ts";
import type { Address } from "../client.ts";

/**
 * @name List Addresses
 * @title List Addresses
 * @description Lista todos os endereços cadastrados do usuário na SuperFrete
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Address[]> => {
  const response = await ctx.api["GET /api/v0/addresses"]({});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro ao buscar endereços: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  return result;
};

export default loader;
