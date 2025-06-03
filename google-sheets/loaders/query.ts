import { AppContext } from "../mod.ts";
import { GOOGLE_SHEETS_URL, TEMP_QUERY_SHEET_NAME } from "../utils/constant.ts";
import { ValueRange } from "../utils/types.ts";
import {
  combineQueryResults,
  getAvailableSheets,
  validateQueryResults,
} from "../utils/mappers.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The ID of the Google Sheets spreadsheet
   */
  spreadsheetId: string;

  /**
   * @title Query
   * @description SQL query to filter data (only the WHERE part onwards) Col2 contains 'rice' Col1 = 1100
   */
  query: string;

  /**
   * @title Source Sheet
   * @description The name of the sheet containing the data to search. If not provided, search will be performed in all sheets.
   */
  sourceSheet?: string;

  /**
   * @title Search All Sheets
   * @description Whether to search all sheets in the spreadsheet and combine results
   */
  searchAllSheets?: boolean;

  /**
   * @title Source Range
   * @description The full range of data in the source sheet, including headers (e.g., A1:Z100)
   */
  sourceRange?: string;

  /**
   * @title Keep Headers
   * @description Whether to keep headers in the results
   */
  keepHeaders?: boolean;

  /**
   * @title Major Dimension
   * @description Determines how to organize values in the matrix (by rows or columns)
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Value Render Option
   * @description How values should be represented in the response
   */
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";

  /**
   * @title Date Time Render Option
   * @description How dates and times should be represented in the response
   */
  dateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

function extractLabels(query: string): string {
  const labelMatch = query.match(/LABEL\s+([^;]+)/i);
  if (!labelMatch) {
    return "LABEL Col1 'Linha Original'";
  }
  return `LABEL ${labelMatch[1].trim()}`;
}

function sanitizeQueryString(query: string): string {
  const processedQuery = query.trim();

  let labelPart = "";
  let queryPart = "";

  if (/LABEL\s+/i.test(processedQuery)) {
    const parts = processedQuery.split(/LABEL\s+/i);
    queryPart = parts[0].trim();
    labelPart = extractLabels(processedQuery);
  } else {
    queryPart = processedQuery;
    labelPart = "LABEL Col1 'Linha Original'";
  }

  queryPart = queryPart.replace(/^SELECT\s+\*(\s+FROM)?/i, "");

  queryPart = queryPart.replace(/^WHERE\s+/i, "");

  queryPart = queryPart.replace(/^\*\s+/i, "");

  queryPart = queryPart.replace(/\*\s+where\s+/i, "");

  queryPart = queryPart.replace(/\s+where\s+/gi, " ");

  const finalQuery = queryPart.trim()
    ? `WHERE ${queryPart.trim()} ${labelPart}`.trim()
    : labelPart.trim();

  return finalQuery;
}

function validateRange(range: string): string {
  if (!range) return "A:Z";

  const [, effectiveRange = range] = range.split("!");

  if (!/^[A-Z]?[0-9]*:[A-Z]?[0-9]*$/.test(effectiveRange)) {
    throw new Error(
      `Invalid range format: ${range}. Expected format like A1:B2, A:Z, or 1:1`,
    );
  }

  return effectiveRange;
}

async function createTempQuerySheet(
  ctx: AppContext,
  spreadsheetId: string,
  sourceSheet: string,
  sourceRange: string,
  query: string,
  keepHeaders: boolean,
): Promise<void> {
  try {
    const addSheetReq = {
      requests: [
        {
          addSheet: {
            properties: {
              title: TEMP_QUERY_SHEET_NAME,
            },
          },
        },
      ],
    };

    const batchUpdateUrl =
      `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const accessToken = ctx.tokens?.access_token;

    const addSheetResponse = await fetch(batchUpdateUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addSheetReq),
    });

    if (!addSheetResponse.ok) {
      throw new Error(
        `Error creating temporary sheet: ${addSheetResponse.statusText}`,
      );
    }

    const validatedRange = validateRange(sourceRange);
    const headerOption = keepHeaders ? "1" : "0";
    const sanitizedQuery = typeof query === "string"
      ? sanitizeQueryString(query)
      : query;

    const enhancedQuery =
      `=QUERY({ARRAYFORMULA(LIN('${sourceSheet}'!A1:A))\\'${sourceSheet}'!${validatedRange}}; "${sanitizedQuery}"; ${headerOption})`;

    const updateFormulaBody = {
      range: `${TEMP_QUERY_SHEET_NAME}!A1`,
      majorDimension: "ROWS",
      values: [[enhancedQuery]],
    };

    const updateFormulaResponse = await ctx.client
      ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
        {
          spreadsheetId,
          range: `${TEMP_QUERY_SHEET_NAME}!A1`,
          valueInputOption: "USER_ENTERED",
        },
        { body: updateFormulaBody },
      );

    if (!updateFormulaResponse.ok) {
      throw new Error(
        `Error adding QUERY formula: ${updateFormulaResponse.statusText}`,
      );
    }
  } catch (error) {
    await deleteTempQuerySheet(ctx, spreadsheetId);
    throw error;
  }
}

async function deleteTempQuerySheet(
  ctx: AppContext,
  spreadsheetId: string,
): Promise<void> {
  const spreadsheetResponse = await ctx.client
    ["GET /v4/spreadsheets/:spreadsheetId"]({
      spreadsheetId,
    });

  if (!spreadsheetResponse.ok) {
    return;
  }

  const spreadsheet = await spreadsheetResponse.json();
  const tempSheet = spreadsheet.sheets?.find(
    (sheet: unknown) =>
      sheet && typeof sheet === "object" &&
      "properties" in sheet && sheet.properties &&
      typeof sheet.properties === "object" &&
      "title" in sheet.properties &&
      sheet.properties.title === TEMP_QUERY_SHEET_NAME,
  );

  if (!tempSheet || !tempSheet.properties?.sheetId) {
    return;
  }

  const deleteSheetReq = {
    requests: [
      {
        deleteSheet: {
          sheetId: tempSheet.properties.sheetId,
        },
      },
    ],
  };

  const batchUpdateUrl =
    `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}:batchUpdate`;

  await fetch(batchUpdateUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ctx.tokens?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deleteSheetReq),
  });
}

/**
 * @name QUERY_SPREADSHEET_DATA
 * @title Search Data with QUERY
 * @description Searches data in a spreadsheet using Google Sheets QUERY formula for efficient filtering
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ValueRange> => {
  const {
    spreadsheetId,
    sourceSheet,
    searchAllSheets = false,
    query,
    sourceRange = "A:Z",
    keepHeaders = true,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID is required");
  }

  if (!query) {
    throw new Error("Query is required");
  }

  const sanitizedQuery = typeof query === "string"
    ? sanitizeQueryString(query)
    : query;

  const spreadsheetResponse = await ctx.client
    ["GET /v4/spreadsheets/:spreadsheetId"]({
      spreadsheetId,
    });

  if (!spreadsheetResponse.ok) {
    ctx.errorHandler.toHttpError(
      spreadsheetResponse,
      `Error accessing spreadsheet: ${spreadsheetResponse.statusText}`,
    );
  }

  const spreadsheet = await spreadsheetResponse.json();

  const availableSheets = getAvailableSheets(
    spreadsheet,
    TEMP_QUERY_SHEET_NAME,
  );

  if (!availableSheets?.length) {
    throw new Error("No sheets found in the spreadsheet");
  }

  let sheetsToSearch: string[] = [];

  if (searchAllSheets) {
    sheetsToSearch = availableSheets;
  } else if (sourceSheet) {
    if (!availableSheets.includes(sourceSheet)) {
      throw new Error(`Sheet '${sourceSheet}' not found`);
    }
    sheetsToSearch = [sourceSheet];
  } else {
    sheetsToSearch = [availableSheets[0]];
  }

  if (sheetsToSearch.length > 1) {
    const allResults: ValueRange[] = [];
    const sheetNames: string[] = [];

    for (const sheet of sheetsToSearch) {
      try {
        await createTempQuerySheet(
          ctx,
          spreadsheetId,
          sheet,
          sourceRange,
          sanitizedQuery,
          keepHeaders,
        );

        const sheetResponse = await ctx.client
          ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
            spreadsheetId,
            range: `${TEMP_QUERY_SHEET_NAME}!A:Z`,
            majorDimension,
            valueRenderOption,
            dateTimeRenderOption,
          });

        if (sheetResponse.ok) {
          const sheetData = await sheetResponse.json();
          if (sheetData.values && sheetData.values.length > 0) {
            allResults.push(sheetData);
            sheetNames.push(sheet);
          }
        }
      } finally {
        await deleteTempQuerySheet(ctx, spreadsheetId);
      }
    }

    return combineQueryResults(
      allResults,
      sheetNames,
      keepHeaders,
      majorDimension,
      ctx.errorHandler,
      sanitizedQuery,
    );
  } else {
    try {
      await createTempQuerySheet(
        ctx,
        spreadsheetId,
        sheetsToSearch[0],
        sourceRange,
        sanitizedQuery,
        keepHeaders,
      );

      const response = await ctx.client
        ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
          spreadsheetId,
          range: `${TEMP_QUERY_SHEET_NAME}!A:Z`,
          majorDimension,
          valueRenderOption,
          dateTimeRenderOption,
        });

      if (!response.ok) {
        ctx.errorHandler.toHttpError(
          response,
          `Error fetching filtered data: ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (data.values) {
        validateQueryResults(data.values, ctx.errorHandler);
      }

      const hasDataBeyondHeaders = data.values &&
        data.values.length > (keepHeaders ? 1 : 0);
      const resultCount = data.values
        ? data.values.length - (keepHeaders ? 1 : 0)
        : 0;

      const resultDetails: Array<{
        sheet: string;
        resultIndex: number;
        originalRowEstimate: number;
        columnCount: number;
        columnRange: string;
      }> = [];

      if (data.values && hasDataBeyondHeaders) {
        const startIndex = keepHeaders ? 1 : 0;
        data.values.slice(startIndex).forEach((row, rowIndex) => {
          const originalRow = row && row[0]
            ? parseInt(String(row[0]))
            : rowIndex + startIndex + 1;
          const dataColumns = row ? row.slice(1) : [];
          const columnCount = dataColumns.length;
          const endColumn = columnCount > 0
            ? String.fromCharCode(64 + columnCount)
            : "A";

          resultDetails.push({
            sheet: sheetsToSearch[0],
            resultIndex: rowIndex,
            originalRowEstimate: originalRow,
            columnCount: columnCount,
            columnRange: columnCount > 0 ? `A-${endColumn}` : "A",
          });
        });
      }

      const enhancedData = {
        ...data,
        meta: {
          totalResults: Math.max(0, resultCount),
          hasResults: hasDataBeyondHeaders,
          query: sanitizedQuery,
          searchedSheet: sheetsToSearch[0],
          message: hasDataBeyondHeaders
            ? `Found ${resultCount} result(s)`
            : "No data found matching the query criteria",
          resultDetails: resultDetails,
        },
      };

      return enhancedData;
    } finally {
      await deleteTempQuerySheet(ctx, spreadsheetId);
    }
  }
};

export default loader;
