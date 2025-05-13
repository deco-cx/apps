import { AppContext } from "../../mod.ts";
import {
  ContractCancellation,
  createSalesContractsClient,
} from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;

  /**
   * @title Data de Cancelamento
   * @description Data de cancelamento do contrato (formato yyyy-MM-dd)
   */
  cancelDate: string;

  /**
   * @title Motivo do Cancelamento
   * @description Razão pela qual o contrato está sendo cancelado
   */
  cancelReason: string;
}

/**
 * @title Cancelar Contrato
 * @description Cancela um contrato de venda no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  try {
    const cancellation: ContractCancellation = {
      cancelDate: props.cancelDate,
      cancelReason: props.cancelReason,
    };

    await salesContractsClient["PUT /sales-contracts/:id/cancellation"](
      { id: props.id },
      {
        body: cancellation,
      },
    );

    return {
      success: true,
      message: "Contrato cancelado com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao cancelar contrato:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cancelar contrato: ${errorMessage}`,
    };
  }
};

export default action;
