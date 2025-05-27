import { AppContext } from "../../mod.ts";
import { ListarArvoreCategoriasModelResponse } from "../../types.ts";

/**
 * @title List All Categories
 * @description Retrieves the complete category tree
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<ListarArvoreCategoriasModelResponse> => {
  try {
    const response = await ctx.api["GET /categorias/todas"]({});
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export default loader;
