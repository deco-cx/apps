import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the price list
   */
  idListaDePreco: number;
}

interface ListaPrecoResponse {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  dataAtualizacao?: string;
}

/**
 * @title Get Price List Details
 * @description Retrieves details of a specific price list
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListaPrecoResponse> => {
  try {
    const { idListaDePreco } = props;

    const response = await ctx.api["GET /listas-precos/:idListaDePreco"]({
      idListaDePreco,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting price list details:", error);
    throw error;
  }
};

export default loader;
