import { AppContext } from "../../mod.ts";
import { createSalesContractsClient } from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;
}

/**
 * @title Remover Contrato
 * @description Remove um contrato de venda no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  try {
    await salesContractsClient["DELETE /sales-contracts/:id"]({
      id: props.id,
    });

    return {
      success: true,
      message: "Contrato removido com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao remover contrato:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao remover contrato: ${errorMessage}`,
    };
  }
};

export default action;
