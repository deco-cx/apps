import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title XML
   * @description Conteúdo do arquivo XML da nota fiscal
   */
  xml: string;
}

/**
 * @title Incluir Nota Fiscal a partir de XML
 * @description Cria uma nova nota fiscal a partir de um arquivo XML
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  id: number;
  numero: string;
}> => {
  try {
    const response = await ctx.api["POST /notas/xml"]({}, {
      body: props,
    });

    const data = await response.json();

    // Transform the API response to match the expected return type
    return {
      id: data.idNota,
      numero: String(data.idNota), // Using the ID as a string since the API doesn't return a numero field
    };
  } catch (error) {
    console.error("Erro ao incluir nota fiscal a partir de XML:", error);
    throw error;
  }
};

export default action;
