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
}

/**
 * @title Buscar Rendas Familiares
 * @description Retorna as rendas familiares de um cliente específico do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ rendas: CustomerFamilyIncome[] }> => {
  const customersClient = createCustomersClient(ctx);

  const response = await customersClient["GET /customers/:id/familyIncomes"]({
    id: props.id,
  });

  const data = await response.json();
  return {
    rendas: data.data,
  };
};

export default loader;
