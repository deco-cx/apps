import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the brand to update
   */
  idMarca: number;

  /**
   * @description New name for the brand (optional)
   */
  nome?: string;

  /**
   * @description New description for the brand (optional)
   */
  descricao?: string;
}

interface MarcaResponse {
  id: number;
  nome: string;
  descricao?: string;
  dataAtualizacao: string;
}

/**
 * @title Update Brand
 * @description Updates an existing brand
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MarcaResponse> => {
  try {
    const { idMarca, ...requestBody } = props;

    const response = await ctx.api["PUT /marcas/:idMarca"]({
      idMarca,
    }, {
      body: requestBody,
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
};

export default action;
