import { AppContext } from "../../mod.ts";
import {
  ContractAttachment,
  createSalesContractsClient,
} from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;

  /**
   * @title ID do Anexo
   * @description ID único do anexo
   */
  attachmentId: number;
}

/**
 * @title Buscar Anexo do Contrato
 * @description Retorna um anexo específico de um contrato de venda do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ContractAttachment> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  const response = await salesContractsClient
    ["GET /sales-contracts/:id/attachments/:attachmentId"]({
      id: props.id,
      attachmentId: props.attachmentId,
    });

  return await response.json();
};

export default loader;
