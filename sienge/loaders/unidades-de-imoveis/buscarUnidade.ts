import { AppContext } from "../../mod.ts";
import { createUnitsClient, Unit } from "../../clients/units.ts";

export interface Props {
  /**
   * @title ID da Unidade
   * @description Código identificador da unidade imobiliária no Sienge
   */
  unitId: number;
}

/**
 * @title Buscar Unidade
 * @description Retorna os dados de uma unidade imobiliária específica pelo ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Unit> => {
  const unitsClient = createUnitsClient(ctx);

  const response = await unitsClient["GET /units/:unitId"]({
    unitId: props.unitId,
  });

  const data = await response.json();
  return data;
};

export default loader;
