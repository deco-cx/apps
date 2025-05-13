import { AppContext } from "../../mod.ts";
import {
  createUnitsClient,
  UnitCharacteristicInsert,
} from "../../clients/units.ts";

export interface Props {
  /**
   * @title Descrição
   * @description Descrição da característica da unidade
   */
  description: string;
}

/**
 * @title Adicionar Característica
 * @description Cadastra uma nova característica para unidades imobiliárias
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const unitsClient = createUnitsClient(ctx);

  try {
    const characteristicInsert: UnitCharacteristicInsert = {
      description: props.description,
    };

    await unitsClient["POST /units/characteristics"](
      {},
      { body: characteristicInsert },
    );

    return {
      success: true,
      message: "Característica cadastrada com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao cadastrar característica:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar característica: ${errorMessage}`,
    };
  }
};

export default action;
