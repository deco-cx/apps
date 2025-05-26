import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The ID of the Google Sheets spreadsheet to retrieve
   */
  spreadsheetId: string;
}

/**
 * @name GET_SPREADSHEET_METADATA
 * @title Get Spreadsheet Metadata
 * @description Gets the metadata of a Google Sheets spreadsheet
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Spreadsheet | { error: string }> => {
  const { spreadsheetId } = props;

  try {
    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId"](
        {
          spreadsheetId,
        },
      );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error retrieving spreadsheet:", error);
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export default loader;
