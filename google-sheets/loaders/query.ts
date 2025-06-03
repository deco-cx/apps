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

function sanitizeQueryString(query: string): string {
  if (!query) return "WHERE 1=1 LABEL Col1 'Linha Original'";

  const processedQuery = query.trim();

  // Uso de expressão regular única para processar a string em uma única passagem
  const hasLabel = /LABEL\s+/i.test(processedQuery);

  // Extrair label e query em uma única operação
  let queryPart;
  let labelPart;

  if (hasLabel) {
    [queryPart, labelPart] = processedQuery.split(/LABEL\s+/i, 2);
    queryPart = queryPart.trim();
    labelPart = `LABEL ${labelPart.trim()}`;
  } else {
    queryPart = processedQuery;
    labelPart = "LABEL Col1 'Linha Original'";
  }

  queryPart = queryPart
    .replace(/^(SELECT\s+\*(\s+FROM)?|\*\s+|WHERE\s+)/i, "")
    .replace(/\*\s+where\s+|\s+where\s+/gi, " ");
  return queryPart.trim()
    ? `WHERE ${queryPart.trim()} ${labelPart}`.trim()
    : labelPart.trim();
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
    const processSheet = async (sheet: string) => {
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
            return { data: sheetData, sheet };
          }
        }
        return null;
      } finally {
        await deleteTempQuerySheet(ctx, spreadsheetId);
      }
    };

    const results = await Promise.allSettled(sheetsToSearch.map(processSheet));

    const validResults = results
      .filter((
        result,
      ): result is PromiseFulfilledResult<
        { data: ValueRange; sheet: string }
      > => result.status === "fulfilled" && result.value !== null)
      .map((result) =>
        (result as PromiseFulfilledResult<{ data: ValueRange; sheet: string }>)
          .value
      );

    const allResults = validResults.map((r) => r.data);
    const sheetNames = validResults.map((r) => r.sheet);

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

      if (!data.values) {
        data.values = [];
      }

      validateQueryResults(data.values, ctx.errorHandler);

      const startIndex = keepHeaders ? 1 : 0;
      const hasDataBeyondHeaders = data.values.length > startIndex;
      const resultCount = data.values.length - startIndex;
      const resultDetails: Array<{
        sheet: string;
        resultIndex: number;
        originalRowEstimate: number;
        columnCount: number;
        columnRange: string;
      }> = [];

      if (hasDataBeyondHeaders) {
        const sheetName = sheetsToSearch[0];
        const getEndColumn = (() => {
          const columnCache = new Map<number, string>();
          return (count: number) => {
            if (count === 0) return "A";
            if (columnCache.has(count)) return columnCache.get(count)!;
            const column = String.fromCharCode(64 + count);
            columnCache.set(count, column);
            return column;
          };
        })();

        data.values.slice(startIndex).forEach((row, rowIndex) => {
          const originalRow = row && row[0]
            ? parseInt(String(row[0]))
            : rowIndex + startIndex + 1;
          const dataColumns = row ? row.slice(1) : [];
          const columnCount = dataColumns.length;
          const endColumn = getEndColumn(columnCount);

          resultDetails.push({
            sheet: sheetName,
            resultIndex: rowIndex,
            originalRowEstimate: originalRow,
            columnCount,
            columnRange: columnCount > 0 ? `A-${endColumn}` : "A",
          });
        });
      }

      // Adicionar metadados e retornar
      data.meta = {
        totalResults: resultCount,
        hasResults: hasDataBeyondHeaders,
        query: sanitizedQuery,
        searchedSheet: sheetsToSearch[0],
        message: hasDataBeyondHeaders
          ? `Found ${resultCount} result(s)`
          : "No data found matching the query criteria",
        resultDetails,
      };

      return data;
    } finally {
      await deleteTempQuerySheet(ctx, spreadsheetId);
    }
  }
};

export default loader;
