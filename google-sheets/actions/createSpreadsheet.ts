import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
  /**
   * @title Spreadsheet Title
   * @description The title for the new spreadsheet
   */
  title: string;

  /**
   * @title Locale
   * @description The locale code for the spreadsheet
   */
  locale?: string;

  /**
   * @title Time Zone
   * @description The time zone of the spreadsheet
   */
  timeZone?: string;

  /**
   * @title Auto Recalculate
   * @description When formulas should be recalculated
   */
  autoRecalc?: "ON_CHANGE" | "MINUTE" | "HOUR";

  /**
   * @title Initial Sheets
   * @description Configuration of the initial sheets in the spreadsheet
   */
  sheets?: Array<{
    /**
     * @title Sheet Title
     * @description Title of the sheet to be created
     */
    title: string;

    /**
     * @title Row Count
     * @description Number of rows in the sheet
     */
    rowCount?: number;

    /**
     * @title Column Count
     * @description Number of columns in the sheet
     */
    columnCount?: number;
  }>;
}

/**
 * @name CREATE_SPREADSHEET
 * @title Create Spreadsheet
 * @description Creates a new spreadsheet in Google Sheets
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Spreadsheet> => {
  const {
    title,
    locale = "pt_BR",
    timeZone = "America/Sao_Paulo",
    autoRecalc = "ON_CHANGE",
    sheets = [{ title: "Sheet1", rowCount: 1000, columnCount: 26 }],
  } = props;

  const { client } = ctx;

  const requestBody = {
    properties: {
      title,
      locale,
      timeZone,
      autoRecalc,
    },
    sheets: sheets.map((sheet) => ({
      properties: {
        title: sheet.title,
        gridProperties: {
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount,
        },
      },
    })),
  };

  try {
    const response = await client["POST /v4/spreadsheets"]({}, {
      body: requestBody,
    });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error creating spreadsheet: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Error creating spreadsheet");
  }
};

export default action;
