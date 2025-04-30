import { AppContext } from "../../mod.ts";
import { createSalesContractsClient } from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;

  /**
   * @title ID do Anexo
   * @description ID único do anexo
   */
  attachmentId: number;
}

/**
 * @title Remover Anexo do Contrato
 * @description Remove um anexo específico de um contrato de venda no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  try {
    await salesContractsClient
      ["DELETE /sales-contracts/:id/attachments/:attachmentId"]({
        id: props.id,
        attachmentId: props.attachmentId,
      });

    return {
      success: true,
      message: "Anexo removido com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao remover anexo do contrato:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao remover anexo do contrato: ${errorMessage}`,
    };
  }
};

export default action;
