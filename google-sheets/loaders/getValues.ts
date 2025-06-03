import { AppContext } from "../mod.ts";
import { ValueRange } from "../utils/types.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The ID of the Google Sheets spreadsheet
   */
  spreadsheetId: string;

  /**
   * @title Range
   * @description The range of cells in A1 notation (e.g., Sheet1!A1:B10) without quotes
   */
  range: string;

  /**
   * @title Major Dimension
   * @description Determines how to organize the values in the matrix (by rows or columns)
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Value Render Option
   * @description How values should be represented in the response
   */
  valueRenderOption?:
    | "FORMATTED_VALUE"
    | "UNFORMATTED_VALUE"
    | "FORMULA";

  /**
   * @title Date Time Render Option
   * @description How date and time values should be represented in the response
   */
  dateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * @name GET_SPREADSHEET_VALUES
 * @title Get Spreadsheet Values
 * @description Gets the values from a specific range of cells in the spreadsheet
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ValueRange> => {
  const {
    spreadsheetId,
    range,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  try {
    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId/values/:range"](
        {
          spreadsheetId,
          range: range,
          majorDimension,
          valueRenderOption,
          dateTimeRenderOption,
        },
      );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error fetching spreadsheet values: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to get spreadsheet values for range "${range}"`,
    );
  }
};

export default loader;
