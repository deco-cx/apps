import { AppContext } from "../../mod.ts";
import { createCreditorsClient, Creditor } from "../../clients/creditors.ts";

export interface Props {
  /**
   * @title ID do Credor
   * @description ID único do credor no Sienge
   */
  creditorId: number;
}

/**
 * @title Buscar Credor
 * @description Retorna os dados de um credor específico do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Creditor> => {
  const creditorsClient = createCreditorsClient(ctx);

  const response = await creditorsClient["GET /creditors/:creditorId"]({
    creditorId: props.creditorId,
  });

  const data = await response.json();
  return data;
};

export default loader;
