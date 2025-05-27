import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Name of the brand
   */
  nome: string;

  /**
   * @description Description of the brand
   */
  descricao?: string;
}

interface MarcaResponse {
  id: number;
  nome: string;
  descricao?: string;
  dataCriacao: string;
}

/**
 * @title Create Brand
 * @description Creates a new brand
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MarcaResponse> => {
  try {
    const response = await ctx.api["POST /marcas"]({}, {
      body: props,
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
};

export default action;
