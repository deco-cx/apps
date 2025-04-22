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

  /**
   * @title Telefones
   * @description Lista de telefones do garantidor
   */
  telefones: Array<{
    /**
     * @title Tipo
     * @description Tipo de telefone (0-Residencial, 1-Comercial, 2-Celular, 3-Recado, 4-Fax)
     */
    type: number;

    /**
     * @title Número
     * @description Número de telefone
     */
    number: string;

    /**
     * @title Nome de Contato
     * @description Nome da pessoa de contato para este telefone
     */
    contactName?: string;
  }>;
}

/**
 * @title Atualizar Telefones do Garantidor
 * @description Atualiza os telefones de um garantidor específico em um contrato de venda no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  try {
    await salesContractsClient
      ["PUT /sales-contracts/:id/guarantors/:guarantorId/phones"](
        {
          id: props.id,
          guarantorId: props.guarantorId,
        },
        {
          body: {
            phones: props.telefones,
          },
        },
      );

    return {
      success: true,
      message: "Telefones do garantidor atualizados com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao atualizar telefones do garantidor:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao atualizar telefones do garantidor: ${errorMessage}`,
    };
  }
};

export default action;
