import { AppContext } from "../../mod.ts";
import {
  createCustomersClient,
  CustomerAddress,
} from "../../clients/customers.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description ID único do cliente no Sienge
   */
  id: number;

  /**
   * @title Tipo de Endereço
   * @description Tipo do endereço (Ex: "home", "work", "correspondence")
   */
  type: string;

  /**
   * @title Endereço
   * @description Logradouro
   */
  address?: string;

  /**
   * @title Número
   * @description Número do endereço
   */
  number?: string;

  /**
   * @title Complemento
   * @description Complemento do endereço
   */
  complement?: string;

  /**
   * @title Bairro
   * @description Bairro
   */
  neighborhood?: string;

  /**
   * @title ID da Cidade
   * @description Código da cidade no Sienge
   */
  cityId?: number;

  /**
   * @title CEP
   * @description CEP do endereço
   */
  zipCode?: string;
}

/**
 * @title Atualizar Endereço
 * @description Atualiza um endereço de determinado tipo para um cliente no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const customersClient = createCustomersClient(ctx);

  try {
    const address: CustomerAddress = {
      address: props.address,
      number: props.number,
      complement: props.complement,
      neighborhood: props.neighborhood,
      cityId: props.cityId,
      zipCode: props.zipCode,
    };

    await customersClient["PUT /customers/:id/addresses/:type"](
      {
        id: props.id,
        type: props.type,
      },
      {
        body: address,
      },
    );

    return {
      success: true,
      message: `Endereço do tipo ${props.type} atualizado com sucesso.`,
    };
  } catch (error: unknown) {
    console.error("Erro ao atualizar endereço:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao atualizar endereço: ${errorMessage}`,
    };
  }
};

export default action;
