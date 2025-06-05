import { AppContext } from "../mod.ts";
import { GOOGLE_SHEETS_URL } from "../utils/constant.ts";

interface Sheet {
  properties?: {
    title?: string;
    sheetId?: number;
  };
}

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description Google Sheets spreadsheet ID
   */
  spreadsheetId: string;

  /**
   * @title Sheet Name
   * @description Name of the sheet to be deleted
   */
  sheetName: string;

  /**
   * @title Sheet ID
   * @description Internal sheet ID to be deleted (optional, alternative to name)
   */
  sheetId?: number;

  /**
   * @title Silent Fail
   * @description If true, does not report errors if sheet is not found
   */
  silentFail?: boolean;
}

/**
 * @name DELETE_TAB
 * @title Delete Sheet
 * @description Deletes a sheet from a Google Sheets spreadsheet
 * @internal true
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> => {
  const {
    spreadsheetId,
    sheetName,
    sheetId,
    silentFail = false,
  } = props;

  try {
    let targetSheetId = sheetId;

    if (!targetSheetId) {
      const spreadsheetResponse = await ctx.client
        ["GET /v4/spreadsheets/:spreadsheetId"]({
          spreadsheetId,
        });

      if (!spreadsheetResponse.ok) {
        if (silentFail) return { success: false };
        throw new Error(
          `Erro ao acessar planilha: ${spreadsheetResponse.statusText}`,
        );
      }

      const spreadsheet = await spreadsheetResponse.json();

      const sheet = spreadsheet.sheets?.find(
        (s: Sheet) => s?.properties?.title === sheetName,
      );

      if (!sheet || !sheet.properties?.sheetId) {
        const alternativeSheet = spreadsheet.sheets?.find(
          (s: Sheet) => s?.properties?.title?.includes(sheetName),
        );

        if (alternativeSheet && alternativeSheet.properties?.sheetId) {
          targetSheetId = alternativeSheet.properties.sheetId;
        } else {
          if (silentFail) return { success: false };
          throw new Error(`Aba "${sheetName}" não encontrada na planilha`);
        }
      } else {
        targetSheetId = sheet.properties.sheetId;
      }
    }

    const accessToken = ctx.tokens?.access_token;

    if (!accessToken) {
      if (silentFail) return { success: false };
      throw new Error("Token de acesso não disponível");
    }

    const deleteSheetReq = {
      requests: [
        {
          deleteSheet: {
            sheetId: targetSheetId,
          },
        },
      ],
    };

    const batchUpdateUrl =
      `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}:batchUpdate`;

    const response = await fetch(batchUpdateUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deleteSheetReq),
    });

    if (!response.ok) {
      if (silentFail) return { success: false };
      const errorText = await response.text();
      throw new Error(
        `Erro ao excluir aba: ${response.statusText}. Detalhes: ${errorText}`,
      );
    }

    return { success: true };
  } catch (error) {
    if (silentFail) return { success: false };
    ctx.errorHandler.toHttpError(error, "Erro ao excluir aba da planilha");
    return { success: false };
  }
};

export default action;
