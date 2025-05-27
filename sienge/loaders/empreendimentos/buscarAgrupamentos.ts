import { AppContext } from "../../mod.ts";
import {
  createEnterprisesClient,
  UnitGrouping,
} from "../../clients/enterprises.ts";

export interface Props {
  /**
   * @title ID do Empreendimento
   * @description Código identificador do empreendimento (obra)
   */
  enterpriseId: number;
}

/**
 * @title Buscar Agrupamentos
 * @description Retorna os valores dos agrupamentos de um empreendimento
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UnitGrouping> => {
  const enterprisesClient = createEnterprisesClient(ctx);

  const response = await enterprisesClient
    ["GET /enterprises/:enterpriseId/groupings"]({
      enterpriseId: props.enterpriseId,
    });

  const data = await response.json();
  return data;
};

export default loader;
