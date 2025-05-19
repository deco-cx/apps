import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the shipping method
   */
  idFormaEnvio: number;
}

interface FormaEnvioResponse {
  id: number;
  nome: string;
  servico?: string;
  ativo: boolean;
  dataAtualizacao?: string;
}

/**
 * @title Get Shipping Method Details
 * @description Retrieves details of a specific shipping method
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FormaEnvioResponse> => {
  try {
    const { idFormaEnvio } = props;

    const response = await ctx.api["GET /formas-envio/:idFormaEnvio"]({
      idFormaEnvio,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting shipping method details:", error);
    throw error;
  }
};

export default loader;
