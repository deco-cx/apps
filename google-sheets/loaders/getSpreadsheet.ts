import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
  /**
   * @title ID da Planilha
   * @description O ID da planilha do Google Sheets a ser obtida
   */
  spreadsheetId: string;
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
  const { spreadsheetId } = props;

  try {
    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId"](
        {
          spreadsheetId,
        },
      );

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter planilha:", error);
    throw error;
  }
};

export default loader;
