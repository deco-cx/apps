import { AppContext } from "../../mod.ts";
import {
  ContractGuarantor,
  createSalesContractsClient,
} from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;
}

/**
 * @title Buscar Garantidores
 * @description Retorna a lista de garantidores de um contrato de venda específico do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ garantidores: ContractGuarantor[] }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  const response = await salesContractsClient
    ["GET /sales-contracts/:id/guarantors"]({
      id: props.id,
    });

  const data = await response.json();
  return {
    garantidores: data.guarantors,
  };
};

export default loader;
