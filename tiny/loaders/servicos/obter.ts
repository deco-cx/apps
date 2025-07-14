import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Service ID
   */
  idServico: number;
}

interface ServicosResponse {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

/**
 * @title Get Service Details
 * @description Gets detailed information about a specific service
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ServicosResponse> => {
  try {
    const { idServico } = props;
    const response = await ctx.api["GET /servicos/:idServico"]({
      idServico,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Error getting service details for ID ${props.idServico}:`,
      error,
    );
    throw error;
  }
};

export default loader;
