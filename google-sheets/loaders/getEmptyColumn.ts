import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description Google Sheets spreadsheet ID
   */
  spreadsheetId: string;

  /**
   * @title Sheet Name
   * @description Name of the sheet
   */
  sheetName: string;

  /**
   * @title Row to Check
   * @description Row number to check (default: 1)
   */
  rowNumber?: number;
}

function indexToColumnLetter(index: number): string {
  let letter = "";
  let num = index;

  do {
    const mod = num % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);

  return letter;
}

/**
 * @name GET_EMPTY_COLUMN
 * @title Find Empty Column
 * @description Finds the first empty column in a sheet
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ column: string; index: number }> => {
  const {
    spreadsheetId,
    sheetName,
    rowNumber = 1,
  } = props;

  try {
    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}:ZZ${rowNumber}`,
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response.status,
        `Error to get empty column: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.values || !data.values[0]) {
      return { column: "A", index: 0 };
    }

    const columnIndex = data.values[0].length;
    const columnLetter = indexToColumnLetter(columnIndex);

    return {
      column: columnLetter,
      index: columnIndex,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Error to get empty column");
    return { column: "A", index: 0 };
  }
};

export default loader;
