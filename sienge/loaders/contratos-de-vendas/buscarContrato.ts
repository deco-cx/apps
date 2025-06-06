import { AppContext } from "../../mod.ts";
import {
  createSalesContractsClient,
  SalesContract,
} from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Contrato
   * @description ID único do contrato de venda no Sienge
   */
  id: number;
}

/**
 * @title Buscar Contrato de Venda
 * @description Retorna os dados de um contrato de venda específico do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SalesContract> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  const response = await salesContractsClient["GET /sales-contracts/:id"]({
    id: props.id,
  });

  const data = await response.json();
  return data.contract;
};

export default loader;
