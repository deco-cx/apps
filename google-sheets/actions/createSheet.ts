import { AppContext } from "../mod.ts";
import { GOOGLE_SHEETS_URL } from "../utils/constant.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description Google Sheets spreadsheet ID
   */
  spreadsheetId: string;

  /**
   * @title Sheet Name
   * @description Name of the sheet to be created
   */
  sheetName: string;

  /**
   * @title Row Count
   * @description Number of rows in the new sheet (optional)
   */
  rowCount?: number;

  /**
   * @title Column Count
   * @description Number of columns in the new sheet (optional)
   */
  columnCount?: number;

  /**
   * @title Insert Index
   * @description Position where the new sheet will be inserted (0 = beginning)
   */
  insertIndex?: number;

  /**
   * @title Generate Unique Name
   * @description If true, adds a random suffix to the sheet name to make it unique
   */
  generateUniqueName?: boolean;
}

/**
 * @name CREATE_TAB
 * @title Create Sheet
 * @description Creates a new sheet in a Google Sheets spreadsheet
 * @internal true
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; sheetName: string; sheetId?: number }> => {
  const {
    spreadsheetId,
    sheetName,
    rowCount = 1000,
    columnCount = 26,
    insertIndex = 0,
    generateUniqueName = false,
  } = props;

  try {
    const finalSheetName = generateUniqueName
      ? `${sheetName}_${Math.floor(Math.random() * 1000000)}`
      : sheetName;

    const addSheetReq = {
      requests: [
        {
          addSheet: {
            properties: {
              title: finalSheetName,
              gridProperties: {
                rowCount,
                columnCount,
              },
              index: insertIndex,
            },
          },
        },
      ],
    };

    const accessToken = ctx.tokens?.access_token;

    if (!accessToken) {
      throw new Error("Token de acesso não disponível");
    }

    const batchUpdateUrl =
      `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}:batchUpdate`;

    const response = await fetch(batchUpdateUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addSheetReq),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro ao criar aba: ${response.statusText}. Detalhes: ${errorText}`,
      );
    }

    const result = await response.json();
    const sheetId = result.replies?.[0]?.addSheet?.properties?.sheetId;

    return {
      success: true,
      sheetName: finalSheetName,
      sheetId,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Erro ao criar aba na planilha");
    return {
      success: false,
      sheetName: "",
    };
  }
};

export default action;
