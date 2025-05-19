import { AppContext } from "../../mod.ts";
import { createProfessionsClient } from "../../clients/professions.ts";

export interface Props {
  /**
   * @title Profissões
   * @description Lista de nomes de profissões a serem cadastradas
   */
  profissoes: string[];
}

/**
 * @title Adicionar Profissões
 * @description Cadastra novas profissões no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const professionsClient = createProfessionsClient(ctx);

  try {
    if (!props.profissoes || props.profissoes.length === 0) {
      return {
        success: false,
        message: "É necessário informar pelo menos uma profissão.",
      };
    }

    await professionsClient["POST /professions"](
      {},
      {
        body: props.profissoes,
      },
    );

    return {
      success: true,
      message:
        `${props.profissoes.length} profissão(ões) cadastrada(s) com sucesso.`,
    };
  } catch (error: unknown) {
    console.error("Erro ao cadastrar profissões:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar profissões: ${errorMessage}`,
    };
  }
};

export default action;
