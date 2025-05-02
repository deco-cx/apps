import { AppContext } from "../../mod.ts";
import { ChildUnitInsert, createUnitsClient } from "../../clients/units.ts";

export interface Props {
  /**
   * @title ID da Unidade Pai
   * @description Código identificador da unidade imobiliária pai
   */
  unitId: number;

  /**
   * @title IDs das Unidades Filhas
   * @description Lista de códigos das unidades a serem adicionadas como filhas
   */
  childUnitIds: number[];
}

/**
 * @title Adicionar Unidades Filhas
 * @description Adiciona uma ou mais unidades filhas a uma unidade pai
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const unitsClient = createUnitsClient(ctx);

  try {
    const childUnitInsert: ChildUnitInsert = {
      childUnitIds: props.childUnitIds,
    };

    await unitsClient["POST /units/:unitId/child-unit"](
      { unitId: props.unitId },
      { body: childUnitInsert },
    );

    return {
      success: true,
      message: "Unidades filhas adicionadas com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao adicionar unidades filhas:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao adicionar unidades filhas: ${errorMessage}`,
    };
  }
};

export default action;
