import { AppContext } from "../mod.ts";
import {
  OptimizedSpreadsheetMetadata,
  Sheet,
  Spreadsheet,
} from "../utils/types.ts";
import {
  calculateDataRange,
  mapSpreadsheetToOptimized,
} from "../utils/mappers.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The ID of the Google Sheets spreadsheet to retrieve
   */
  spreadsheetId: string;
}

/**
 * Fetches spreadsheet metadata from Google Sheets API
 */
async function fetchSpreadsheetMetadata(
  client: AppContext["client"],
  spreadsheetId: string,
): Promise<Spreadsheet> {
  const response = await client["GET /v4/spreadsheets/:spreadsheetId"]({
    spreadsheetId,
  });
  return response.json();
}

/**
 * Fetches data range for a specific sheet
 */
async function fetchSheetDataRange(
  client: AppContext["client"],
  spreadsheetId: string,
  sheetTitle: string,
): Promise<{ range: string; filledCells: number } | null> {
  try {
    const response = await client
      ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
        spreadsheetId,
        range: sheetTitle,
      });

    const data = await response.json();
    return data.values ? calculateDataRange(data.values, sheetTitle) : null;
  } catch (error) {
    console.warn(`Failed to get data range for sheet "${sheetTitle}":`, error);
    return null;
  }
}

/**
 * Fetches data ranges for all sheets in parallel
 */
async function fetchAllSheetDataRanges(
  client: AppContext["client"],
  spreadsheetId: string,
  sheets: Sheet[],
): Promise<Record<string, { range: string; filledCells: number }>> {
  const dataRanges: Record<string, { range: string; filledCells: number }> = {};

  const sheetTitles = sheets
    .map((sheet) => sheet?.properties?.title)
    .filter((title): title is string => Boolean(title));

  const rangePromises = sheetTitles.map(async (sheetTitle) => {
    const rangeInfo = await fetchSheetDataRange(
      client,
      spreadsheetId,
      sheetTitle,
    );
    return { sheetTitle, rangeInfo };
  });

  const results = await Promise.allSettled(rangePromises);

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.rangeInfo) {
      dataRanges[result.value.sheetTitle] = result.value.rangeInfo;
    }
  });

  return dataRanges;
}

/**
 * @name GET_SPREADSHEET_METADATA
 * @title Get Spreadsheet Metadata
 * @description Gets optimized metadata of a Google Sheets spreadsheet with data ranges
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<OptimizedSpreadsheetMetadata | { error: string }> => {
  const { spreadsheetId } = props;

  try {
    const spreadsheetData = await fetchSpreadsheetMetadata(
      ctx.client,
      spreadsheetId,
    );
    const sheets = spreadsheetData.sheets || [];
    const dataRanges = await fetchAllSheetDataRanges(
      ctx.client,
      spreadsheetId,
      sheets,
    );

    return mapSpreadsheetToOptimized(spreadsheetData, dataRanges);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      error: `Failed to retrieve spreadsheet: ${errorMessage}`,
    };
  }
};

export default loader;
