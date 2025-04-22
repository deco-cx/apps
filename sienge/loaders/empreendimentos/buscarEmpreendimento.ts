import { AppContext } from "../../mod.ts";
import {
  createEnterprisesClient,
  DetailedEnterprise,
} from "../../clients/enterprises.ts";

export interface Props {
  /**
   * @title ID do Empreendimento
   * @description Código identificador do empreendimento (obra) no Sienge
   */
  enterpriseId: number;
}

/**
 * @title Buscar Empreendimento
 * @description Retorna os dados detalhados de um empreendimento específico pelo ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DetailedEnterprise> => {
  const enterprisesClient = createEnterprisesClient(ctx);

  const response = await enterprisesClient["GET /enterprises/:enterpriseId"]({
    enterpriseId: props.enterpriseId,
  });

  const data = await response.json();
  return data;
};

export default loader;
