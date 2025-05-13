import { AppContext } from "../../mod.ts";
import { createSalesContractsClient } from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;

  /**
   * @title Garantidores
   * @description Lista de garantidores do contrato
   */
  garantidores: Array<{
    /**
     * @title ID do Garantidor
     * @description ID do cliente ou credor que será garantidor
     */
    guarantorId: number;
  }>;
}

/**
 * @title Adicionar Garantidores
 * @description Adiciona garantidores a um contrato de venda no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  try {
    await salesContractsClient["POST /sales-contracts/:id/guarantors"](
      { id: props.id },
      {
        body: {
          guarantors: props.garantidores,
        },
      },
    );

    return {
      success: true,
      message: "Garantidores adicionados com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao adicionar garantidores:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao adicionar garantidores: ${errorMessage}`,
    };
  }
};

export default action;
