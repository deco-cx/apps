import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the intermediary
   */
  idIntermediador: number;
}

interface IntermediadorResponse {
  id: number;
  nome: string;
  tipoPessoa: string;
  cpfCnpj?: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}

/**
 * @title Get Intermediary Details
 * @description Retrieves details of a specific intermediary
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<IntermediadorResponse> => {
  try {
    const { idIntermediador } = props;

    const response = await ctx.api["GET /intermediadores/:idIntermediador"]({
      idIntermediador,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting intermediary details:", error);
    throw error;
  }
};

export default loader;
