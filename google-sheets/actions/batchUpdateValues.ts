import { AppContext } from "../mod.ts";
import {
  BatchUpdateValuesRequest,
  BatchUpdateValuesResponse,
} from "../utils/types.ts";

export interface BatchUpdateData {
  /**
   * @title Cell Range
   * @description The range of cells to update in A1 notation. Examples: "Sheet1!A1:B10", "Data!C2:E5"
   * @pattern ^[^!]*![A-Z]+[0-9]+:[A-Z]+[0-9]+$|^[A-Z]+[0-9]+:[A-Z]+[0-9]+$
   */
  range: string;

  /**
   * @title Values to Write
   * @description 2D array of values for this specific range. Each sub-array represents a row.
   * @examples [["Product", "Price"], ["Laptop", 999.99], ["Mouse", 29.99]]
   */
  values: (string | number | boolean | null)[][];

  /**
   * @title Data Organization
   * @description How to interpret the data matrix for this range. ROWS = each inner array is a row, COLUMNS = each inner array is a column
   * @default "ROWS"
   */
  majorDimension?: "ROWS" | "COLUMNS";
}

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The unique identifier of the Google Sheets spreadsheet. Found in the URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   * @pattern ^[a-zA-Z0-9-_]+$
   */
  spreadsheetId: string;

  /**
   * @title Batch Update Data
   * @description Array of ranges and their corresponding values to update. Each element updates a different range in the spreadsheet.
   * @minItems 1
   * @maxItems 100
   */
  data: BatchUpdateData[];

  /**
   * @title Value Input Mode
   * @description How Google Sheets should interpret ALL input values across all ranges:
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

export interface BatchUpdateValuesSuccess extends BatchUpdateValuesResponse {
  /**
   * @description The spreadsheet that was updated
   */
  spreadsheetId: string;
  
  /**
   * @description Total number of updated value ranges
   */
  totalUpdatedRange?: number;
  
  /**
   * @description Total number of rows updated across all ranges
   */
  totalUpdatedRows?: number;
  
  /**
   * @description Total number of columns updated across all ranges
   */
  totalUpdatedColumns?: number;
  
  /**
   * @description Total number of cells updated across all ranges
   */
  totalUpdatedCells?: number;
}

export interface BatchUpdateValuesError {
  /**
   * @description Error message from Google Sheets API
   */
  error: string;
}

/**
 * @title Batch Update Spreadsheet Values
 * @description Updates multiple ranges of cells in a Google Sheets spreadsheet in a single API call. More efficient than multiple individual updates.
 * 
 * Common use cases:
 * - Updating multiple tables/sections in different parts of the sheet
 * - Populating headers and data in separate ranges
 * - Updating summary sections alongside detailed data
 * - Bulk operations across multiple sheets in the same spreadsheet
 * 
 * Tips for AI usage:
 * - Group related updates into a single batch for better performance
 * - Use different ranges for headers vs data to maintain formatting
 * - Consider using this for complex reports with multiple sections
 * - All ranges use the same valueInputOption, so group similar data types
 * - Maximum 100 ranges per batch update
 * 
 * Performance benefits:
 * - Reduces API calls (rate limiting friendly)
 * - Atomic operation (all succeed or all fail)
 * - Better for user experience in interactive applications
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BatchUpdateValuesSuccess | BatchUpdateValuesError> => {
  const {
    spreadsheetId,
    data,
    valueInputOption = "USER_ENTERED",
    includeValuesInResponse = false,
    responseValueRenderOption = "FORMATTED_VALUE",
    responseDateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  const { client } = ctx;

  // Validate and structure the request body
  const requestBody: BatchUpdateValuesRequest = {
    valueInputOption,
    includeValuesInResponse,
    responseValueRenderOption: includeValuesInResponse
      ? responseValueRenderOption
      : undefined,
    responseDateTimeRenderOption: includeValuesInResponse
      ? responseDateTimeRenderOption
      : undefined,
    data: data.map((item) => ({
      range: item.range,
      majorDimension: item.majorDimension || "ROWS",
      values: item.values.map((row) =>
        row.map((cell) => {
          if (cell === null || cell === undefined) return "";
          if (typeof cell === "object" && Object.keys(cell).length === 0) {
            return "";
          }
          return cell;
        })
      ),
    })),
  };

  const response = await client
    ["POST /v4/spreadsheets/:spreadsheetId/values:batchUpdate"](
      { spreadsheetId },
      { body: requestBody },
    );

  if (!response.ok) {
    const errorText = await response.text();
    return {
      error: errorText,
    } as BatchUpdateValuesError;
  }

  return await response.json() as BatchUpdateValuesSuccess;
};

export default action;
