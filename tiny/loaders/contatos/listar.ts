import { AppContext } from "../../mod.ts";
import { ListagemContatoModelResponse } from "../../types.ts";

export interface Props {
  nome?: string;
  codigo?: string;
  situacao?: "B" | "A" | "I" | "E";
  idVendedor?: number;
  cpfCnpj?: string;
  celular?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  orderBy?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * @title List Contacts
 * @description Lists contacts with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  itens: ListagemContatoModelResponse[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}> => {
  try {
    const response = await ctx.api["GET /contatos"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing contacts:", error);
    throw error;
  }
};

export default loader;
