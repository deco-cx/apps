import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Service ID
   */
  idServico: number;

  /**
   * @description Service name
   */
  nome?: string;

  /**
   * @description Service description
   */
  descricao?: string;

  /**
   * @description Service price
   */
  valor?: number;

  /**
   * @description Service observations
   */
  observacoes?: string;

  /**
   * @description Active status
   */
  ativo?: boolean;
}

interface AtualizarServicoResponse {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  observacoes?: string;
  ativo: boolean;
  dataAtualizacao: string;
}

/**
 * @title Update Service
 * @description Updates an existing service in the system
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AtualizarServicoResponse> => {
  try {
    const { idServico, ...updateData } = props;

    const response = await ctx.api["PUT /servicos/:idServico"]({
      idServico,
    }, {
      body: updateData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update service: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating service ID ${props.idServico}:`, error);
    throw error;
  }
};

export default action;
