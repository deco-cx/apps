import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the payment method
   */
  idFormaPagamento: number;
}

interface FormaPagamentoResponse {
  id: number;
  nome: string;
  numeroParcelas: number;
  ativo: boolean;
  dataAtualizacao?: string;
}

/**
 * @title Get Payment Method Details
 * @description Retrieves details of a specific payment method
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FormaPagamentoResponse> => {
  try {
    const { idFormaPagamento } = props;

    const response = await ctx.api["GET /formas-pagamento/:idFormaPagamento"]({
      idFormaPagamento,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting payment method details:", error);
    throw error;
  }
};

export default loader;
