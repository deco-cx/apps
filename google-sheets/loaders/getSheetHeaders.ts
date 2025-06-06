import { AppContext } from "../mod.ts";
import { CellValue } from "../utils/types.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description Google Sheets spreadsheet ID
   */
  spreadsheetId: string;

  /**
   * @title Sheet Name
   * @description Name of the sheet containing the data
   */
  sheetName: string;

  /**
   * @title Range
   * @description Cell range (columns only, e.g. A:Z)
   */
  range?: string;

  /**
   * @title Header Row
   * @description Row number containing the headers (default: 1)
   */
  headerRow?: number;

  /**
   * @title Major Dimension
   * @description How to organize values in the matrix (by rows or columns)
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Value Render Option
   * @description How values should be represented in the response
   */
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";
}

export interface HeadersResult {
  labels: Record<string, string>;

  headerMap: Map<string, number>;

  headerValues: string[];
}

function processHeaders(headers: CellValue[][]): HeadersResult {
  const labels: Record<string, string> = {};
  const headerMap = new Map<string, number>();
  const headerValues: string[] = [];

  if (headers && headers.length > 0) {
    const headerRow = headers[0];

    headerRow.forEach((cell: CellValue, index: number) => {
      if (cell) {
        const colNum = index + 1;
        const headerName = String(cell);
        labels[`Col${colNum}`] = headerName;
        headerMap.set(headerName, index);
        headerValues.push(headerName);
      }
    });
  }

  return { labels, headerMap, headerValues };
}

/**
 * @name GET_SHEET_HEADERS
 * @title Get Sheet Headers
 * @description Get the headers of a sheet in a Google Sheets spreadsheet
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<HeadersResult> => {
  const {
    spreadsheetId,
    sheetName,
    range = "A:Z",
    headerRow = 1,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
  } = props;

  try {
    const rangeStart = range.split(":")[0];
    const rangeEnd = range.split(":")[1].replace(/[0-9]/g, "");
    const headerRange =
      `${sheetName}!${rangeStart}${headerRow}:${rangeEnd}${headerRow}`;

    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
        spreadsheetId,
        range: headerRange,
        majorDimension,
        valueRenderOption,
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error to get sheet headers: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.values || !data.values[0]) {
      return { labels: {}, headerMap: new Map(), headerValues: [] };
    }

    return processHeaders(data.values);
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Error to get sheet headers");
  }
};

export default loader;
