import { AppContext } from "../mod.ts";
import { ValueRange } from "../utils/types.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The ID of the Google Sheets spreadsheet
   */
  spreadsheetId: string;

  /**
   * @title Ranges
   * @description List of cell ranges in A1 notation (e.g., ["Sheet1!A1:B10", "Sheet2!C3:D4"])
   */
  ranges: string[];

  /**
   * @title Major Dimension
   * @description Determines the ordering of returned values
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Value Render Option
   * @description How values should be represented
   */
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";

  /**
   * @title Date Time Render Option
   * @description How date and time values should be represented
   */
  dateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * @name GET_BATCH_SPREADSHEET_VALUES
 * @title Get Batch Spreadsheet Values
 * @description Reads values from multiple cell ranges of a Google Sheets spreadsheet
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ valueRanges: ValueRange[] }> => {
  const {
    spreadsheetId,
    ranges,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  try {
    const fetchPromises = ranges.map(async (range) => {
      const response = await ctx.client
        ["GET /v4/spreadsheets/:spreadsheetId/values/:range"](
          {
            spreadsheetId,
            range,
            majorDimension,
            valueRenderOption,
            dateTimeRenderOption,
          },
        );

      if (!response.ok) {
        ctx.errorHandler.toHttpError(
          response,
          `Error fetching spreadsheet values for range ${range}: ${response.statusText}`,
        );
      }

      return response.json();
    });

    const valueRanges = await Promise.all(fetchPromises);

    return { valueRanges };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Error fetching spreadsheet values");
  }
};

export default loader;
