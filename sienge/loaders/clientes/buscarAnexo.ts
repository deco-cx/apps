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

  /**
   * @title ID do Anexo
   * @description ID único do anexo
   */
  attachmentId: number;
}

/**
 * @title Buscar Anexo
 * @description Retorna um anexo específico de um cliente do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CustomerAttachment> => {
  const customersClient = createCustomersClient(ctx);

  const response = await customersClient
    ["GET /customers/:id/attachments/:attachmentId"]({
      id: props.id,
      attachmentId: props.attachmentId,
    });

  return await response.json();
};

export default loader;
