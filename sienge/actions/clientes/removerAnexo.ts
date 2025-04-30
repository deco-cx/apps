import { AppContext } from "../../mod.ts";
import { createCustomersClient } from "../../clients/customers.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description ID único do cliente no Sienge
   */
  id: number;

  /**
   * @title ID do Anexo
   * @description ID único do anexo
   */
  attachmentId: number;
}

/**
 * @title Remover Anexo
 * @description Remove um anexo específico de um cliente no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const customersClient = createCustomersClient(ctx);

  try {
    await customersClient["DELETE /customers/:id/attachments/:attachmentId"]({
      id: props.id,
      attachmentId: props.attachmentId,
    });

    return {
      success: true,
      message: "Anexo removido com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao remover anexo:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao remover anexo: ${errorMessage}`,
    };
  }
};

export default action;
