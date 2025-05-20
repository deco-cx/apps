import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
  /**
   * @title ID da Planilha
   * @description O ID da planilha do Google Sheets a ser obtida
   */
  spreadsheetId: string;

  /**
   * @title Token de Autenticação
   * @description O token de autenticação para acessar o Google Sheets
   */
  token: string;
}

/**
 * @title Obter Planilha
 * @description Obtém os metadados de uma planilha do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Spreadsheet> => {
  const { spreadsheetId, token } = props;

  try {
    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId"](
        {
          spreadsheetId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao obter planilha:", error);
    throw error;
  }
};

export default loader;
