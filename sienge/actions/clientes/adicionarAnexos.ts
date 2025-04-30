import { AppContext } from "../../mod.ts";
import { createCustomersClient } from "../../clients/customers.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description ID único do cliente no Sienge
   */
  id: number;

  /**
   * @title Anexos
   * @description Lista de anexos do cliente
   */
  anexos: Array<{
    /**
     * @title Nome do Arquivo
     * @description Nome do arquivo a ser anexado
     */
    fileName: string;

    /**
     * @title Descrição
     * @description Descrição do anexo
     */
    description?: string;

    /**
     * @title Arquivo
     * @description Conteúdo do arquivo em base64
     */
    file: string;
  }>;
}

/**
 * @title Adicionar Anexos
 * @description Adiciona anexos a um cliente no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const customersClient = createCustomersClient(ctx);

  try {
    await customersClient["POST /customers/:id/attachments"](
      { id: props.id },
      {
        body: {
          attachments: props.anexos,
        },
      },
    );

    return {
      success: true,
      message: "Anexos adicionados com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao adicionar anexos:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao adicionar anexos: ${errorMessage}`,
    };
  }
};

export default action;
