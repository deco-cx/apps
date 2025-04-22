import { AppContext } from "../../mod.ts";
import { createUnitsClient, UnitCharacteristic } from "../../clients/units.ts";

export interface CharacteristicItem {
  /**
   * @title ID da Característica
   * @description Código identificador da característica
   */
  id: number;

  /**
   * @title Quantidade
   * @description Quantidade da característica na unidade
   */
  quantity: number;
}

export interface Props {
  /**
   * @title ID da Unidade
   * @description Código identificador da unidade imobiliária
   */
  unitId: number;

  /**
   * @title Características
   * @description Lista de características e suas quantidades
   */
  characteristics: CharacteristicItem[];
}

/**
 * @title Atualizar Características da Unidade
 * @description Atualiza as características atribuídas a uma unidade imobiliária
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const unitsClient = createUnitsClient(ctx);

  try {
    const characteristicList: UnitCharacteristic[] = props.characteristics.map(
      (item) => ({
        id: item.id,
        quantity: item.quantity,
      }),
    );

    await unitsClient["PUT /units/:unitId/characteristics"](
      { unitId: props.unitId },
      { body: characteristicList },
    );

    return {
      success: true,
      message: "Características da unidade atualizadas com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao atualizar características da unidade:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao atualizar características da unidade: ${errorMessage}`,
    };
  }
};

export default action;
