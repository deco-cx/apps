import { AppContext } from "../../mod.ts";
import { createCustomersClient, Customer } from "../../clients/customers.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description ID único do cliente no Sienge
   */
  id: number;
}

/**
 * @title Buscar Cliente
 * @description Retorna os dados de um cliente específico do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Customer> => {
  const customersClient = createCustomersClient(ctx);

  const response = await customersClient["GET /customers/:id"]({
    id: props.id,
  });

  const cliente = await response.json();
  return cliente;
};

export default loader;
