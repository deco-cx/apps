import { AppContext } from "../mod.ts";
import type {
  SimpleUpdateProps,
  SimpleUpdateResponse,
} from "../utils/types.ts";
import {
  mapApiUpdateResponseToSimple,
  mapSimpleUpdatePropsToApi,
  validateSimpleUpdateProps,
} from "../utils/mappers.ts";
import { buildFullRange } from "../utils/rangeUtils.ts";

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

  /**
   * @title Response Value Render Option
   * @description How to format values in response: FORMATTED_VALUE, UNFORMATTED_VALUE or FORMULA
   */
  responseValueRenderOption?:
    | "FORMATTED_VALUE"
    | "UNFORMATTED_VALUE"
    | "FORMULA";

  /**
   * @title Response Date Time Render Option
   * @description How to format dates in response: FORMATTED_STRING or SERIAL_NUMBER
   */
  responseDateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

function mapPropsToApiFormat(props: Props): SimpleUpdateProps {
  const firstCell = props.first_cell_location || "A1";
  const range = buildFullRange(props.sheet_name, firstCell, props.values);

  return {
    spreadsheetId: props.spreadsheet_id,
    range: range,
    values: props.values,
    valueInputOption: props.valueInputOption || "USER_ENTERED",
    includeValuesInResponse: props.includeValuesInResponse || false,
    responseValueRenderOption: props.responseValueRenderOption ||
      "FORMATTED_VALUE",
    responseDateTimeRenderOption: props.responseDateTimeRenderOption ||
      "SERIAL_NUMBER",
  };
}

/**
 * @name UPDATE_SPREADSHEET_VALUES
 * @title Update Spreadsheet Values
 * @description Updates cell values in a Google Sheets spreadsheet in a simple and intuitive way. Just specify the sheet name, starting cell and data, and the system will automatically calculate the required range.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimpleUpdateResponse> => {
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

  const simpleProps = mapPropsToApiFormat(props);

  const validationErrors = validateSimpleUpdateProps(simpleProps);
  if (validationErrors.length > 0) {
    ctx.errorHandler.toHttpError(
      new Error("Validation failed"),
      `Validation error: ${validationErrors.join(", ")}`,
    );
  }

  const { body, params } = mapSimpleUpdatePropsToApi(simpleProps);

  const response = await ctx.client
    ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
      params,
      { body },
    );

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Error updating spreadsheet values: ${response.statusText}`,
    );
  }

  const apiResponse = await response.json();
  return mapApiUpdateResponseToSimple(apiResponse);
};

export default action;
