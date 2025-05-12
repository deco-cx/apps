import { BatchUpdateSpreadsheetRequest, BatchUpdateValuesRequest, BatchUpdateValuesResponse, DeveloperMetadata, FilterView, ProtectedRange, SheetProperties, Spreadsheet, UpdateValuesResponse, ValueRange } from "./types.ts";

// Definição da interface do cliente para Google Sheets
export interface GoogleSheetsClient {
    // Endpoints para planilhas
    "GET /v4/spreadsheets/:spreadsheetId": {
        response: Spreadsheet;
    };

    "GET /v4/spreadsheets/:spreadsheetId/values/:range": {
        response: ValueRange;
    };

    "GET /v4/spreadsheets/:spreadsheetId/values/:ranges*": {
        response: { valueRanges: ValueRange[] };
        searchParams: {
            ranges?: string[];
            majorDimension?: string;
            valueRenderOption?: string;
            dateTimeRenderOption?: string;
        };
    };

    "POST /v4/spreadsheets": {
        response: Spreadsheet;
        body: {
            properties?: {
                title?: string;
                locale?: string;
                autoRecalc?: string;
                timeZone?: string;
            };
            sheets?: {
                properties?: SheetProperties;
            }[];
        };
    };

    "PUT /v4/spreadsheets/:spreadsheetId/values/:range": {
        response: UpdateValuesResponse;
        body: ValueRange;
        searchParams: {
            valueInputOption?: string;
            includeValuesInResponse?: boolean;
            responseValueRenderOption?: string;
            responseDateTimeRenderOption?: string;
        };
    };

    "POST /v4/spreadsheets/:spreadsheetId/values/:range:append": {
        response: UpdateValuesResponse;
        body: ValueRange;
        searchParams: {
            valueInputOption?: string;
            insertDataOption?: string;
            includeValuesInResponse?: boolean;
            responseValueRenderOption?: string;
            responseDateTimeRenderOption?: string;
        };
    };

    "POST /v4/spreadsheets/:spreadsheetId/values:batchUpdate": {
        response: BatchUpdateValuesResponse;
        body: BatchUpdateValuesRequest;
    };

    "POST /v4/spreadsheets/:spreadsheetId:batchUpdate": {
        response: Spreadsheet;
        body: BatchUpdateSpreadsheetRequest;
    };

    // Endpoints para protected ranges
    "POST /v4/spreadsheets/:spreadsheetId/sheets/:sheetId/protectedRanges": {
        response: ProtectedRange;
        body: ProtectedRange;
    };

    // Endpoints para metadados de desenvolvedor
    "GET /v4/spreadsheets/:spreadsheetId/developerMetadata": {
        response: { developerMetadata: DeveloperMetadata[] };
    };

    // Endpoints para filtros
    "POST /v4/spreadsheets/:spreadsheetId/sheets/:sheetId/filterViews": {
        response: FilterView;
        body: FilterView;
    };
} 