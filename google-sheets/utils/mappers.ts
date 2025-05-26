/**
 * Utilities for mapping between simplified types and official Google API types
 */

import type {
  CellValue,
  SimpleBatchUpdateProps,
  SimpleBatchUpdateResponse,
  SimpleError,
  SimpleUpdateProps,
  SimpleUpdateResponse,
  SimpleValueRange,
  TableData,
} from "./types.ts";

import type {
  BatchUpdateValuesRequest,
  BatchUpdateValuesResponse,
  UpdateValuesResponse,
  ValueRange,
} from "./types.ts";

/**
 * Cleans and validates a cell value
 */
export function cleanCellValue(value: CellValue): string | number | boolean {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  return String(value);
}

/**
 * Converts simple tabular data to API format
 */
export function mapTableDataToApiValues(
  data: TableData,
): (string | number | boolean)[][] {
  return data.map((row) => row.map((cell) => cleanCellValue(cell)));
}

/**
 * Converts SimpleValueRange to API ValueRange
 */
export function mapSimpleValueRangeToApi(simple: SimpleValueRange): ValueRange {
  return {
    range: simple.range,
    majorDimension: simple.majorDimension || "ROWS",
    values: mapTableDataToApiValues(simple.values),
  };
}

/**
 * Converts simple props to API updateValues format
 */
export function mapSimpleUpdatePropsToApi(props: SimpleUpdateProps): {
  body: ValueRange;
  params: {
    spreadsheetId: string;
    range: string;
    valueInputOption: string;
    includeValuesInResponse?: boolean;
    responseValueRenderOption?: string;
    responseDateTimeRenderOption?: string;
  };
} {
  const body: ValueRange = {
    range: props.range,
    majorDimension: "ROWS",
    values: mapTableDataToApiValues(props.values),
  };

  const params = {
    spreadsheetId: props.spreadsheetId,
    range: props.range,
    valueInputOption: props.valueInputOption || "USER_ENTERED",
    ...(props.includeValuesInResponse && {
      includeValuesInResponse: true,
      responseValueRenderOption: props.responseValueRenderOption ||
        "FORMATTED_VALUE",
      responseDateTimeRenderOption: props.responseDateTimeRenderOption ||
        "SERIAL_NUMBER",
    }),
  };

  return { body, params };
}

/**
 * Converts simple props to API batchUpdate format
 */
export function mapSimpleBatchUpdatePropsToApi(props: SimpleBatchUpdateProps): {
  body: BatchUpdateValuesRequest;
  params: {
    spreadsheetId: string;
  };
} {
  const body: BatchUpdateValuesRequest = {
    valueInputOption: props.valueInputOption || "USER_ENTERED",
    includeValuesInResponse: props.includeValuesInResponse || false,
    data: props.data.map((item) => mapSimpleValueRangeToApi(item)),
  };

  if (props.includeValuesInResponse) {
    body.responseValueRenderOption = props.responseValueRenderOption ||
      "FORMATTED_VALUE";
    body.responseDateTimeRenderOption = props.responseDateTimeRenderOption ||
      "SERIAL_NUMBER";
  }

  const params = {
    spreadsheetId: props.spreadsheetId,
  };

  return { body, params };
}

/**
 * Converts API values to simple tabular data
 */
export function mapApiValuesToTableData(
  values?: (string | number | boolean)[][],
): TableData {
  if (!values) return [];
  return values.map((row) => row.map((cell) => cell as CellValue));
}

/**
 * Converts API ValueRange to SimpleValueRange
 */
export function mapApiValueRangeToSimple(
  apiRange: ValueRange,
): SimpleValueRange {
  return {
    range: apiRange.range || "",
    values: mapApiValuesToTableData(apiRange.values),
    majorDimension: (apiRange.majorDimension as "ROWS" | "COLUMNS") || "ROWS",
  };
}

/**
 * Converts API updateValues response to simple format
 */
export function mapApiUpdateResponseToSimple(
  apiResponse: UpdateValuesResponse,
): SimpleUpdateResponse {
  return {
    spreadsheetId: apiResponse.spreadsheetId || "",
    updatedRange: apiResponse.updatedRange || "",
    updatedRows: apiResponse.updatedRows || 0,
    updatedColumns: apiResponse.updatedColumns || 0,
    updatedCells: apiResponse.updatedCells || 0,
    updatedData: apiResponse.updatedData
      ? mapApiValueRangeToSimple(apiResponse.updatedData)
      : undefined,
  };
}

/**
 * Converts API batchUpdate response to simple format
 */
export function mapApiBatchUpdateResponseToSimple(
  apiResponse: BatchUpdateValuesResponse,
): SimpleBatchUpdateResponse {
  return {
    spreadsheetId: apiResponse.spreadsheetId || "",
    totalUpdatedRanges: apiResponse.responses?.length || 0,
    totalUpdatedRows: apiResponse.totalUpdatedRows || 0,
    totalUpdatedColumns: apiResponse.totalUpdatedColumns || 0,
    totalUpdatedCells: apiResponse.totalUpdatedCells || 0,
    responses: (apiResponse.responses || []).map((response) =>
      mapApiUpdateResponseToSimple(response)
    ),
  };
}

/**
 * Converts API error to simple format
 */
export function mapApiErrorToSimple(error: unknown): SimpleError {
  if (typeof error === "string") {
    return { message: error };
  }

  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;

    return {
      code: errorObj.code as string,
      message: errorObj.message as string || "Unknown error",
      details: errorObj,
    };
  }

  return {
    message: "Unknown error",
    details: { originalError: error },
  };
}

/**
 * Attempts to parse an API error text
 */
export function parseApiErrorText(errorText: string): SimpleError {
  try {
    const parsed = JSON.parse(errorText);
    return mapApiErrorToSimple(parsed);
  } catch {
    return {
      message: errorText || "API communication error",
    };
  }
}

/**
 * Validates if a range is in the correct format
 */
export function validateRange(range: string): boolean {
  const rangePattern = /^([^!]*!)?[A-Z]+[0-9]+(:[A-Z]+[0-9]+)?$/;
  return rangePattern.test(range);
}

/**
 * Validates if table data is valid
 */
export function validateTableData(data: TableData): boolean {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true;
  return data.every((row) => Array.isArray(row));
}

/**
 * Validates simple update props
 */
export function validateSimpleUpdateProps(props: SimpleUpdateProps): string[] {
  const errors: string[] = [];

  if (!props.spreadsheetId) {
    errors.push("spreadsheetId is required");
  }

  if (!props.range) {
    errors.push("range is required");
  } else if (!validateRange(props.range)) {
    errors.push("range must be in A1 format like A1 or A1:B10");
  }

  if (!props.values) {
    errors.push("values is required");
  } else if (!validateTableData(props.values)) {
    errors.push("values must be an array of arrays");
  }

  return errors;
}

/**
 * Validates simple batch update props
 */
export function validateSimpleBatchUpdateProps(
  props: SimpleBatchUpdateProps,
): string[] {
  const errors: string[] = [];

  if (!props.spreadsheetId) {
    errors.push("spreadsheetId is required");
  }

  if (!props.data || !Array.isArray(props.data)) {
    errors.push("data must be an array");
  } else {
    if (props.data.length === 0) {
      errors.push("data cannot be empty");
    }

    if (props.data.length > 100) {
      errors.push("data cannot have more than 100 ranges");
    }

    props.data.forEach((item, index) => {
      if (!item.range) {
        errors.push(`data[${index}].range is required`);
      } else if (!validateRange(item.range)) {
        errors.push(
          `data[${index}].range must be in A1 format like A1 or A1:B10`,
        );
      }

      if (!item.values) {
        errors.push(`data[${index}].values is required`);
      } else if (!validateTableData(item.values)) {
        errors.push(`data[${index}].values must be an array of arrays`);
      }
    });
  }

  return errors;
}
