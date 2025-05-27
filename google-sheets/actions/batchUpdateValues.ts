import { AppContext } from "../mod.ts";
import type {
  Result,
  SimpleBatchUpdateProps,
  SimpleBatchUpdateResponse,
  SimpleError,
  SimpleValueRange,
} from "../utils/types.ts";
import {
  mapApiBatchUpdateResponseToSimple,
  mapSimpleBatchUpdatePropsToApi,
  parseApiErrorText,
  validateSimpleBatchUpdateProps,
} from "../utils/mappers.ts";
import { buildFullRange } from "../utils/rangeUtils.ts";

/**
 * Simplified props for batch updating values
 */
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
 * Maps simplified props to the expected API format
 */
function mapPropsToApiFormat(props: Props): SimpleBatchUpdateProps {
  const firstCell = props.first_cell_location || "A1";
  const range = buildFullRange(props.sheet_name, firstCell, props.values);

  const simpleData: SimpleValueRange[] = [{
    range: range,
    values: props.values,
    majorDimension: "ROWS",
  }];

  return {
    spreadsheetId: props.spreadsheet_id,
    data: simpleData,
    valueInputOption: props.valueInputOption || "USER_ENTERED",
    includeValuesInResponse: props.includeValuesInResponse || false,
    responseValueRenderOption: "FORMATTED_VALUE",
    responseDateTimeRenderOption: "SERIAL_NUMBER",
  };
}

/**
 * @name BATCH_UPDATE_SPREADSHEET_VALUES
 * @title Batch Update Spreadsheet Values
 * @description Updates values in a Google Sheets spreadsheet in a simple and intuitive way. Just specify the sheet name, starting cell and data, and the system will automatically calculate the required range.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result<SimpleBatchUpdateResponse>> => {
  if (!props.spreadsheet_id || !props.sheet_name || !props.values) {
    return {
      message:
        "Missing required parameters: spreadsheet_id, sheet_name and values are required",
    } as SimpleError;
  }

  if (!Array.isArray(props.values) || props.values.length === 0) {
    return {
      message: "The 'values' parameter must be a non-empty array of arrays",
    } as SimpleError;
  }

  if (!props.values.every((row) => Array.isArray(row))) {
    return {
      message: "All elements in 'values' must be arrays (representing rows)",
    } as SimpleError;
  }

  try {
    const simpleProps = mapPropsToApiFormat(props);

    const validationErrors = validateSimpleBatchUpdateProps(simpleProps);
    if (validationErrors.length > 0) {
      return {
        message: `Validation error: ${validationErrors.join(", ")}`,
      } as SimpleError;
    }

    const { body, params } = mapSimpleBatchUpdatePropsToApi(simpleProps);

    const response = await ctx.client
      ["POST /v4/spreadsheets/:spreadsheetId/values:batchUpdate"](
        params,
        { body },
      );

    if (!response.ok) {
      const errorText = await response.text();
      return parseApiErrorText(errorText);
    }

    const apiResponse = await response.json();
    return mapApiBatchUpdateResponseToSimple(apiResponse);
  } catch (error) {
    return {
      message: `Communication error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      details: { originalError: error },
    } as SimpleError;
  }
};

export default action;
