import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description Google Sheets spreadsheet ID
   */
  spreadsheetId: string;

  /**
   * @title Sheet Name
   * @description Name of the sheet where the formula will be added
   */
  sheetName: string;

  /**
   * @title Range
   * @description Cell or range where the formula will be inserted (e.g. A1, B2:C3)
   */
  range: string;

  /**
   * @title Formula
   * @description Formula to be inserted in the cell (e.g. =SUM(A1:A10))
   */
  formula: string;
}

/**
 * @name ADD_FORMULA
 * @title Add Formula
 * @description Adds a formula to a specific cell or range
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; updatedRange: string }> => {
  const { spreadsheetId, sheetName, range, formula } = props;

  try {
    if (!spreadsheetId) {
      throw new Error("ID da planilha é obrigatório");
    }

    if (!sheetName) {
      throw new Error("Nome da aba é obrigatório");
    }

    if (!range) {
      throw new Error("Range é obrigatório");
    }

    if (!formula) {
      throw new Error("Fórmula é obrigatória");
    }

    const fullRange = `${sheetName}!${range}`;

    const response = await ctx.client
      ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
        {
          spreadsheetId,
          range: fullRange,
          valueInputOption: "USER_ENTERED",
        },
        {
          body: {
            range: fullRange,
            majorDimension: "ROWS",
            values: [[formula]],
          },
        },
      );

    if (!response.ok) {
      throw new Error(`Erro ao adicionar fórmula: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      updatedRange: result.updatedRange || fullRange,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Erro ao adicionar fórmula");
    return {
      success: false,
      updatedRange: "",
    };
  }
};

export default action;
