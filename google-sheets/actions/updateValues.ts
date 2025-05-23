import { AppContext } from "../mod.ts";
import type { UpdateValuesResponse, ValueRange } from "../utils/types.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The unique identifier of the Google Sheets spreadsheet. Found in the URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   * @pattern ^[a-zA-Z0-9-_]+$
   */
  spreadsheetId: string;

  /**
   * @title Cell Range
   * @description The range of cells to update in A1 notation. Examples: "Sheet1!A1:B10", "Data!C2:E5", "A1:Z100"
   * @pattern ^[^!]*![A-Z]+[0-9]+:[A-Z]+[0-9]+$|^[A-Z]+[0-9]+:[A-Z]+[0-9]+$
   */
  range: string;

  /**
   * @title Values to Write
   * @description 2D array of values to write to the spreadsheet. Each sub-array represents a row. Use strings, numbers, booleans, or formulas.
   * @examples [["Name", "Age", "Email"], ["John", 30, "john@example.com"], ["Jane", 25, "jane@example.com"]]
   */
  values: (string | number | boolean | null)[][];

  /**
   * @title Data Organization
   * @description How to interpret the input data matrix. ROWS = each inner array is a row, COLUMNS = each inner array is a column
   * @default "ROWS"
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Value Input Mode
   * @description How Google Sheets should interpret the input values:
   * - RAW: Values stored exactly as entered (strings only)
   * - USER_ENTERED: Parse values as if typed by user (formulas, numbers, dates automatically converted)
   * @default "USER_ENTERED"
   */
  valueInputOption?: "RAW" | "USER_ENTERED";

  /**
   * @title Include Updated Values in Response
   * @description Whether to return the updated cell values in the API response. Useful for confirmation or getting formatted results.
   * @default false
   */
  includeValuesInResponse?: boolean;

  /**
   * @title Response Value Format
   * @description How values should be formatted in the response (only applies if includeValuesInResponse=true):
   * - FORMATTED_VALUE: Values as they appear in the UI (e.g., "$1,000.00")
   * - UNFORMATTED_VALUE: Raw calculated values (e.g., 1000)
   * - FORMULA: The formulas themselves (e.g., "=SUM(A1:A10)")
   * @default "FORMATTED_VALUE"
   */
  responseValueRenderOption?:
    | "FORMATTED_VALUE"
    | "UNFORMATTED_VALUE"
    | "FORMULA";

  /**
   * @title Date/Time Response Format
   * @description How dates and times should be formatted in the response (only applies if includeValuesInResponse=true):
   * - FORMATTED_STRING: Human-readable format (e.g., "Sep 1, 2008 3:00:00 PM")
   * - SERIAL_NUMBER: Excel-style serial number (e.g., 39682.625)
   * @default "SERIAL_NUMBER"
   */
  responseDateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

export interface UpdateValuesSuccess extends UpdateValuesResponse {
  /**
   * @description The spreadsheet that was updated
   */
  spreadsheetId: string;
  
  /**
   * @description The number of rows that were updated
   */
  updatedRows?: number;
  
  /**
   * @description The number of columns that were updated
   */
  updatedColumns?: number;
  
  /**
   * @description The number of cells that were updated
   */
  updatedCells?: number;
}

export interface UpdateValuesError {
  /**
   * @description Error message from Google Sheets API
   */
  error: string;
}

/**
 * @title Update Spreadsheet Values
 * @description Updates cell values in a Google Sheets spreadsheet. Use this to write data to specific ranges of cells.
 * 
 * Common use cases:
 * - Writing structured data (tables, lists)
 * - Updating specific cells with calculated values  
 * - Inserting formulas for automatic calculations
 * - Batch updating multiple rows/columns at once
 * 
 * Tips for AI usage:
 * - Always specify the exact range you want to update
 * - Use USER_ENTERED for formulas and automatic type conversion
 * - Use RAW when you need exact string values
 * - Include response values when you need to verify the update
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateValuesSuccess | UpdateValuesError> => {
  const {
    spreadsheetId,
    range,
    values,
    majorDimension = "ROWS",
    valueInputOption = "USER_ENTERED",
    includeValuesInResponse = false,
    responseValueRenderOption = "FORMATTED_VALUE",
    responseDateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  // Validate and clean the input values
  const validatedValues = values.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) return "";
      if (typeof cell === "object" && Object.keys(cell).length === 0) {
        return "";
      }
      return cell;
    })
  );

  const body: ValueRange = {
    range,
    majorDimension,
    values: validatedValues,
  };

  const response = await ctx.client
    ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
      {
        spreadsheetId,
        range: encodeURIComponent(range),
        valueInputOption,
        ...(includeValuesInResponse
          ? {
            includeValuesInResponse,
            responseValueRenderOption,
            responseDateTimeRenderOption,
          }
          : {}),
      },
      { body },
    );

  if (!response.ok) {
    const errorText = await response.text();
    return {
      error: errorText,
    } as UpdateValuesError;
  }

  return await response.json() as UpdateValuesSuccess;
};

export default action;
