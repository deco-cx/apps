/**
 * Utilities for mapping between simplified types and official Google API types
 */

import type {
  ActionBatchUpdateProps,
  CellValue,
  OptimizedSpreadsheetMetadata,
  Sheet,
  SimpleBatchUpdateProps,
  SimpleBatchUpdateResponse,
  SimpleUpdateProps,
  SimpleUpdateResponse,
  SimpleValueRange,
  Spreadsheet,
  TableData,
} from "./types.ts";

import type {
  BatchUpdateValuesRequest,
  BatchUpdateValuesResponse,
  UpdateValuesResponse,
  ValueRange,
} from "./types.ts";
import {
  buildFullRange,
  columnNumberToLetter,
  isValidCellReference,
} from "./rangeUtils.ts";

function cleanCellValue(value: CellValue): string | number | boolean {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  return String(value);
}
function mapTableDataToApiValues(
  data: TableData,
): (string | number | boolean)[][] {
  return data.map((row) => row.map((cell) => cleanCellValue(cell)));
}

function mapSimpleValueRangeToApi(simple: SimpleValueRange): ValueRange {
  return {
    range: simple.range,
    majorDimension: simple.majorDimension || "ROWS",
    values: mapTableDataToApiValues(simple.values),
  };
}

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
function mapApiValuesToTableData(
  values?: CellValue[][],
): TableData {
  if (!values) return [];
  return values.map((row) => row.map((cell) => cell as CellValue));
}

function mapApiValueRangeToSimple(
  apiRange: ValueRange,
): SimpleValueRange {
  return {
    range: apiRange.range || "",
    values: mapApiValuesToTableData(apiRange.values),
    majorDimension: (apiRange.majorDimension as "ROWS" | "COLUMNS") || "ROWS",
  };
}

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

export function validateRange(range: string): boolean {
  const rangePart = range.includes("!") ? range.split("!")[1] : range;

  if (rangePart.includes(":")) {
    const [start, end] = rangePart.split(":");
    return isValidCellReference(start) && isValidCellReference(end);
  } else {
    return isValidCellReference(rangePart);
  }
}
function validateTableData(data: TableData): boolean {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true;
  return data.every((row) => Array.isArray(row));
}

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

export function mapSpreadsheetToOptimized(
  spreadsheetData: Spreadsheet,
  dataRanges?: Record<string, { range: string; filledCells: number }>,
): OptimizedSpreadsheetMetadata {
  return {
    spreadsheetId: spreadsheetData.spreadsheetId,
    title: spreadsheetData.properties?.title || "",
    url: spreadsheetData.spreadsheetUrl || "",
    locale: spreadsheetData.properties?.locale,
    sheets: (spreadsheetData.sheets || []).map((sheet: Sheet) => {
      const sheetTitle = sheet.properties?.title || "";
      const rangeInfo = dataRanges?.[sheetTitle];

      return {
        id: sheet.properties?.sheetId || 0,
        title: sheetTitle,
        rowCount: sheet.properties?.gridProperties?.rowCount || 0,
        columnCount: sheet.properties?.gridProperties?.columnCount || 0,
        dataRange: rangeInfo?.range,
        filledCells: rangeInfo?.filledCells,
      };
    }),
  };
}

function isCellFilled(cell: CellValue): boolean {
  return cleanCellValue(cell) !== "";
}

export function calculateDataRange(
  values: CellValue[][],
  sheetTitle: string,
): { range: string; filledCells: number } | null {
  if (!values || values.length === 0) return null;

  let maxRow = 0;
  let maxCol = 0;

  for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
    const row = values[rowIndex];
    if (!row) continue;

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cell = row[colIndex];
      if (isCellFilled(cell)) {
        maxRow = Math.max(maxRow, rowIndex + 1);
        maxCol = Math.max(maxCol, colIndex + 1);
      }
    }
  }

  if (maxRow === 0 || maxCol === 0) return null;

  const endColumn = columnNumberToLetter(maxCol);
  const range = `${sheetTitle}!A1:${endColumn}${maxRow}`;

  return {
    range,
    filledCells: maxRow * maxCol,
  };
}

export function mapActionPropsToSimpleBatchUpdate(
  props: ActionBatchUpdateProps,
): SimpleBatchUpdateProps {
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
