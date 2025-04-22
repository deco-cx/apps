import { AppContext } from "../../mod.ts";
import {
  createCustomersClient,
  CustomerProcurator,
} from "../../clients/customers.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description ID único do cliente no Sienge
   */
  id: number;

  /**
   * @title Nome
   * @description Nome do procurador
   */
  name: string;

  /**
   * @title Telefone
   * @description Número de telefone do procurador
   */
  phoneNumber?: string;

  /**
   * @title Celular
   * @description Número de celular do procurador
   */
  cellPhoneNumber?: string;

  /**
   * @title Email
   * @description Endereço de email do procurador
   */
  email?: string;

  /**
   * @title CPF
   * @description CPF do procurador (somente números)
   */
  cpf?: string;

  /**
   * @title Data de Nascimento
   * @description Data de nascimento do procurador (formato yyyy-MM-dd)
   */
  birthDate?: string;
}

/**
 * @title Atualizar Procurador
 * @description Atualiza os dados do procurador de um cliente no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const customersClient = createCustomersClient(ctx);

  try {
    const procurator: CustomerProcurator = {
      name: props.name,
      phoneNumber: props.phoneNumber,
      cellPhoneNumber: props.cellPhoneNumber,
      email: props.email,
      cpf: props.cpf,
      birthDate: props.birthDate,
    };

    await customersClient["PUT /customers/:id/procurator"](
      { id: props.id },
      {
        body: procurator,
      },
    );

    return {
      success: true,
      message: "Procurador atualizado com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao atualizar procurador:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao atualizar procurador: ${errorMessage}`,
    };
  }
};

export default action;
