import type { State } from "../../mod.ts";
import {
  createCostCentersClient,
  ImmediateRegisterSettings,
} from "../../clients/costCenters.ts";

/**
 * Loader para obter configurações de registro ATO de um centro de custo
 */
export interface Props {
  /**
   * @title ID do Centro de Custo
   * @description Código do centro de custo para consultar configurações
   */
  costCenterId: number;
}

/**
 * @title Buscar Configurações de Registro ATO
 * @description Obtém as configurações de registro ATO de um centro de custo
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<ImmediateRegisterSettings> => {
  const { costCenterId } = props;
  const client = createCostCentersClient(ctx.state);

  const response = await client
    ["GET /cost-centers/immediate-register-settings"]({
      costCenterId,
    });

  // Handle response based on the TypedResponse contract
  const data = await response.json();
  return data;
};

export default loader;
