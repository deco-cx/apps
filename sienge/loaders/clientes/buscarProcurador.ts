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
}

/**
 * @title Buscar Procurador
 * @description Retorna os dados do procurador de um cliente específico do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CustomerProcurator> => {
  const customersClient = createCustomersClient(ctx);

  const response = await customersClient["GET /customers/:id/procurator"]({
    id: props.id,
  });

  return await response.json();
};

export default loader;
