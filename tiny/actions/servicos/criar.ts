import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Service name
   */
  nome: string;

  /**
   * @description Service description
   */
  descricao?: string;

  /**
   * @description Service price
   */
  valor: number;

  /**
   * @description Service observations
   */
  observacoes?: string;

  /**
   * @description Active status
   */
  ativo?: boolean;
}

interface CriarServicoResponse {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: string;
}

/**
 * @title Create Service
 * @description Creates a new service in the system
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CriarServicoResponse> => {
  try {
    const response = await ctx.api["POST /servicos"](
      {},
      {
        body: props,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create service: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

export default action;
