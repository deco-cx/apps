import type { AppContext } from "../mod.ts";
import type { ServiceInfo } from "../client.ts";

/**
 * @name Get Services Information
 * @title Get Services Information
 * @description Gets information about available delivery services in SuperFrete
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<ServiceInfo[]> => {
  const response = await ctx.api["GET /api/v0/services/info"]({});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro ao buscar informações dos serviços: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  return result;
};

export default loader;
