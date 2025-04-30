import { AppContext } from "../../mod.ts";
import { createUnitsClient, UnitSituationInsert } from "../../clients/units.ts";

export interface Props {
  /**
   * @title Descrição
   * @description Descrição da situação da unidade
   */
  description: string;
}

/**
 * @title Adicionar Situação
 * @description Cadastra uma nova situação para unidades imobiliárias
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const unitsClient = createUnitsClient(ctx);

  try {
    const situationInsert: UnitSituationInsert = {
      description: props.description,
    };

    await unitsClient["POST /units/situations"](
      {},
      { body: situationInsert },
    );

    return {
      success: true,
      message: "Situação cadastrada com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao cadastrar situação:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar situação: ${errorMessage}`,
    };
  }
};

export default action;
