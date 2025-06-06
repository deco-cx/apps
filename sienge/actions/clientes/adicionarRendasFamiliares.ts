import { AppContext } from "../../mod.ts";
import {
  createCustomersClient,
  CustomerFamilyIncome,
} from "../../clients/customers.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description ID único do cliente no Sienge
   */
  id: number;

  /**
   * @title Rendas Familiares
   * @description Lista de rendas familiares do cliente
   */
  rendas: CustomerFamilyIncome[];
}

/**
 * @title Adicionar Rendas Familiares
 * @description Cadastra rendas familiares para um cliente no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const customersClient = createCustomersClient(ctx);

  try {
    await customersClient["POST /customers/:id/familyIncomes"](
      { id: props.id },
      {
        body: {
          familyIncomes: props.rendas,
        },
      },
    );

    return {
      success: true,
      message: "Rendas familiares cadastradas com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao adicionar rendas familiares:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar rendas familiares: ${errorMessage}`,
    };
  }
};

export default action;
