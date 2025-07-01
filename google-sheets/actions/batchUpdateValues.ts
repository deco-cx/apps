import { AppContext } from "../mod.ts";
import type { SimpleBatchUpdateResponse } from "../utils/types.ts";
import {
  mapActionPropsToSimpleBatchUpdate,
  mapApiBatchUpdateResponseToSimple,
  mapSimpleBatchUpdatePropsToApi,
  validateSimpleBatchUpdateProps,
} from "../utils/mappers.ts";

export interface Props {
  /**
   * @title First Cell Location
   * @description The starting cell for the update range, specified in A1 notation (e.g., 'A1', 'B2')
   */
  first_cell_location?: string;

  /**
   * @title Include Values in Response
   * @description Whether to return the updated values in the API response
   */
  includeValuesInResponse?: boolean;

  /**
   * @title Sheet Name
   * @description The name of the specific sheet within the spreadsheet to update
   */
  sheet_name: string;

  /**
   * @title Spreadsheet ID
   * @description The unique identifier of the Google Sheets spreadsheet to be updated
   */
  spreadsheet_id: string;

  /**
   * @title Value Input Option
   * @description Use 'RAW' to store values as-is or 'USER_ENTERED' to interpret formulas
   */
  valueInputOption?: "RAW" | "USER_ENTERED";

  /**
   * @title Values
   * @description A 2D list representing the values to update. Each inner list corresponds to a row in the spreadsheet
   */
  values: string[][];
}

/**
 * @name BATCH_UPDATE_SPREADSHEET_VALUES
 * @title Batch Update Spreadsheet Values
 * @description Updates values in a Google Sheets spreadsheet in a simple and intuitive way. Just specify the sheet name, starting cell and data, and the system will automatically calculate the required range.
 * @internal true
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimpleBatchUpdateResponse> => {
  if (!props.spreadsheet_id || !props.sheet_name || !props.values) {
    ctx.errorHandler.toHttpError(
      new Error("Missing required parameters"),
      "Missing required parameters: spreadsheet_id, sheet_name and values are required",
    );
  }

  if (!Array.isArray(props.values) || props.values.length === 0) {
    ctx.errorHandler.toHttpError(
      new Error("Invalid values format"),
      "The 'values' parameter must be a non-empty array of arrays",
    );
  }

  if (!props.values.every((row) => Array.isArray(row))) {
    ctx.errorHandler.toHttpError(
      new Error("Invalid row format"),
      "All elements in 'values' must be arrays (representing rows)",
    );
  }

  try {
    const simpleProps = mapActionPropsToSimpleBatchUpdate(props);

    const validationErrors = validateSimpleBatchUpdateProps(simpleProps);
    if (validationErrors.length > 0) {
      ctx.errorHandler.toHttpError(
        new Error("Validation failed"),
        `Validation error: ${validationErrors.join(", ")}`,
      );
    }

    const { body } = mapSimpleBatchUpdatePropsToApi(simpleProps);

    const response = await ctx.client
      ["POST /v4/spreadsheets/:spreadsheetId:batchUpdate"]({
        // @ts-expect-error Google thought putting : on the endpoint path was cool. Our client handles it, but the types are not inferred.
        spreadsheetId: props.spreadsheet_id,
      }, {
        body,
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error updating spreadsheet values: ${response.statusText}`,
      );
    }

    const apiResponse = await response.json();
    return mapApiBatchUpdateResponseToSimple(apiResponse);
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Communication error during batch update",
    );
  }
};

export default action;
