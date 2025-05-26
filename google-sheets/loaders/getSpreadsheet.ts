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
): Promise<Spreadsheet> => {
  const { spreadsheetId } = props;

  const response = await ctx.client
    ["GET /v4/spreadsheets/:spreadsheetId"](
      {
        spreadsheetId,
      },
    );

  if (!response.ok) {
    throw new Error(
      `Error fetching spreadsheet metadata: ${response.statusText}`,
    );
  }

  return await response.json();
};

export default loader;
