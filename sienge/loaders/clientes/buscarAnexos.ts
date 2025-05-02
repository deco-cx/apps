import { AppContext } from "../../mod.ts";
import {
  createCustomersClient,
  CustomerAttachment,
} from "../../clients/customers.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description ID único do cliente no Sienge
   */
  id: number;
}

/**
 * @title Buscar Anexos
 * @description Retorna a lista de anexos de um cliente específico do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ anexos: CustomerAttachment[] }> => {
  const customersClient = createCustomersClient(ctx);

  const response = await customersClient["GET /customers/:id/attachments"]({
    id: props.id,
  });

  const data = await response.json();
  return {
    anexos: data.data,
  };
};

export default loader;
