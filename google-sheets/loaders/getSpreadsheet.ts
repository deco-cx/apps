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

async function fetchSpreadsheetMetadata(
  client: AppContext["client"],
  errorHandler: AppContext["errorHandler"],
  spreadsheetId: string,
): Promise<Spreadsheet> {
  try {
    const response = await client["GET /v4/spreadsheets/:spreadsheetId"]({
      spreadsheetId,
    });
    return response.json();
  } catch (error) {
    errorHandler.toHttpError(
      error,
      `Failed to get spreadsheet metadata for spreadsheet "${spreadsheetId}"`,
    );
  }
}

async function fetchSheetDataRange(
  client: AppContext["client"],
  errorHandler: AppContext["errorHandler"],
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

    if (!response.ok) {
      errorHandler.toHttpError(
        response,
        `Failed to get data range for sheet "${sheetTitle}": ${response.statusText}`,
      );
    }

    return data.values ? calculateDataRange(data.values, sheetTitle) : null;
  } catch (error) {
    errorHandler.toHttpError(
      error,
      `Failed to get data range for sheet "${sheetTitle}"`,
    );
    return null;
  }
}

async function fetchAllSheetDataRanges(
  client: AppContext["client"],
  errorHandler: AppContext["errorHandler"],
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
      errorHandler,
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
): Promise<OptimizedSpreadsheetMetadata> => {
  const { spreadsheetId } = props;

  if (!spreadsheetId) {
    ctx.errorHandler.toHttpError(
      new Error("Spreadsheet ID is required"),
      "Spreadsheet ID is required",
    );
  }

  try {
    const spreadsheetData = await fetchSpreadsheetMetadata(
      ctx.client,
      ctx.errorHandler,
      spreadsheetId,
    );
    const dataRanges = await fetchAllSheetDataRanges(
      ctx.client,
      ctx.errorHandler,
      spreadsheetId,
      spreadsheetData.sheets || [],
    );

    return mapSpreadsheetToOptimized(spreadsheetData, dataRanges);
  } catch (error: unknown) {
    ctx.errorHandler.toHttpError(error, "Error fetching spreadsheet metadata");
  }
};

export default loader;
