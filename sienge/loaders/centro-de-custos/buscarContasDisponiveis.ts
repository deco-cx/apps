import type { State } from "../../mod.ts";
import {
  createCostCentersClient,
  DetailedCostCenterAvailable,
} from "../../clients/costCenters.ts";

/**
 * Loader para obter contas disponíveis de um centro de custo
 */
export interface Props {
  /**
   * @title ID do Centro de Custo
   * @description Código do centro de custo para consultar contas disponíveis
   */
  costCenterId: number;
}

/**
 * @title Buscar Contas Disponíveis
 * @description Obtém as contas correntes disponíveis para um centro de custo específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<DetailedCostCenterAvailable> => {
  const { costCenterId } = props;
  const client = createCostCentersClient(ctx.state);

  const response = await client["GET /cost-centers/:costCenterId/available"]({
    costCenterId,
  });

  // Handle response based on the TypedResponse contract
  const data = await response.json();
  return data;
};

export default loader;
