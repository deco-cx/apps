import type { State } from "../../mod.ts";
import {
  createCostCentersClient,
  DetailedCostCenter,
} from "../../clients/costCenters.ts";

/**
 * Loader para obter um centro de custo específico do Sienge
 */
export interface Props {
  /**
   * @title ID do Centro de Custo
   * @description Código do centro de custo a ser consultado
   */
  costCenterId: number;
}

/**
 * @title Buscar Centro de Custo
 * @description Obtém um centro de custo específico pelo ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<DetailedCostCenter> => {
  const { costCenterId } = props;
  const client = createCostCentersClient(ctx.state);

  const response = await client["GET /cost-centers/:costCenterId"]({
    costCenterId,
  });

  // Handle response based on the TypedResponse contract
  const data = await response.json();
  return data;
};

export default loader;
