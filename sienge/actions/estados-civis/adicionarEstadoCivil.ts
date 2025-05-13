import { AppContext } from "../../mod.ts";
import {
  createCivilStatusClient,
  EstCivilInsert,
} from "../../clients/civilStatus.ts";

export interface Props {
  /**
   * @title Descrição
   * @description Descrição do estado civil
   */
  description: string;

  /**
   * @title Tipo
   * @description Tipo do estado civil
   * @enum [1, 2, 3, 4, 5]
   */
  type: 1 | 2 | 3 | 4 | 5; // 1: Solteiro(a), 2: Casado(a), 3: Separado(a), 4: Divorciado(a), 5: Viúvo(a)
}

/**
 * @title Adicionar Estado Civil
 * @description Cadastra um novo estado civil no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const civilStatusClient = createCivilStatusClient(ctx);

  try {
    const estCivilInsert: EstCivilInsert = {
      description: props.description,
      type: props.type,
    };

    await civilStatusClient["POST /civil-status"](
      {},
      { body: estCivilInsert },
    );

    return {
      success: true,
      message: "Estado civil cadastrado com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao cadastrar estado civil:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar estado civil: ${errorMessage}`,
    };
  }
};

export default action;
