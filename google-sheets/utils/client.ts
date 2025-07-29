import {
  BatchUpdateSpreadsheetRequest,
  DeveloperMetadata,
  FilterView,
  ProtectedRange,
  Spreadsheet,
  UpdateValuesResponse,
  ValueRange,
} from "./types.ts";

export interface GoogleSheetsClient {
  "GET /v4/spreadsheets/:spreadsheetId": {
    response: Spreadsheet;
  };
  "GET /v4/spreadsheets/:spreadsheetId/values/:range": {
    response: ValueRange;
    searchParams?: {
      majorDimension?: string;
      valueRenderOption?: string;
      dateTimeRenderOption?: string;
    };
  };
  "GET /v4/spreadsheets/:spreadsheetId/values/:ranges*": {
    response: { valueRanges: ValueRange[] };
    searchParams: {
      ranges: string[];
      majorDimension?: string;
      valueRenderOption?: string;
      dateTimeRenderOption?: string;
    };
  };
  "POST /v4/spreadsheets": {
    response: Spreadsheet;
    body: {
      properties: {
        title: string;
        locale?: string;
        autoRecalc?: string;
        timeZone?: string;
      };
      sheets?: {
        properties: {
          title: string;
        };
      }[];
    };
  };
  "PUT /v4/spreadsheets/:spreadsheetId/values/:range": {
    response: UpdateValuesResponse;
    body: ValueRange;
    searchParams?: {
      valueInputOption?: string;
      includeValuesInResponse?: boolean;
      responseValueRenderOption?: string;
      responseDateTimeRenderOption?: string;
    };
  };
  "POST /v4/spreadsheets/:spreadsheetId/values/:range:append": {
    response: UpdateValuesResponse;
    body: ValueRange;
    searchParams?: {
      valueInputOption?: string;
      insertDataOption?: string;
      includeValuesInResponse?: boolean;
      responseValueRenderOption?: string;
      responseDateTimeRenderOption?: string;
    };
  };
  "POST /v4/spreadsheets/:spreadsheetId:batchUpdate": {
    response: Spreadsheet;
    body: BatchUpdateSpreadsheetRequest;
  };
  "POST /v4/spreadsheets/:spreadsheetId/sheets/:sheetId/protectedRanges": {
    response: ProtectedRange;
    body: ProtectedRange;
  };
  "GET /v4/spreadsheets/:spreadsheetId/developerMetadata": {
    response: { developerMetadata: DeveloperMetadata[] };
  };
  "POST /v4/spreadsheets/:spreadsheetId/sheets/:sheetId/filterViews": {
    response: FilterView;
    body: FilterView;
  };
}
