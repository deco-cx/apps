import { AppContext } from "../../mod.ts";
import { createSalesContractsClient } from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;

  /**
   * @title ID do Garantidor
   * @description ID único do garantidor no contrato
   */
  guarantorId: number;
}

/**
 * @title Remover Garantidor
 * @description Remove um garantidor específico de um contrato de venda no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  try {
    await salesContractsClient
      ["DELETE /sales-contracts/:id/guarantors/:guarantorId"]({
        id: props.id,
        guarantorId: props.guarantorId,
      });

    return {
      success: true,
      message: "Garantidor removido com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao remover garantidor:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao remover garantidor: ${errorMessage}`,
    };
  }
};

export default action;
