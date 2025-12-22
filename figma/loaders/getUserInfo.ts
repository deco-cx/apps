import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../utils/client.ts";

/**
 * @title Get User Info
 * @description Retrieves information about the authenticated user
 */
export default async function getUserInfo(
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<
  FigmaResponse<{
    id: string;
    email: string;
    handle: string;
    img_url: string;
  }>
> {
  try {
    const response = await ctx.client["GET /v1/me"]({});

    if (!response.ok) {
      return {
        err: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();

    return {
      status: response.status,
      data: data,
    };
  } catch (error) {
    return {
      err: `Erro interno: ${
        error instanceof Error ? error.message : String(error)
      }`,
      status: 500,
    };
  }
}
