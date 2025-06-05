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
   * @description Name of the sheet to be copied
   */
  sheetName: string;

  /**
   * @title Copy Name
   * @description Custom name for the copy (optional)
   */
  copyName?: string;
}

/**
 * @name COPY_TAB
 * @title Copy Sheet
 * @description Creates a copy of a sheet within the same spreadsheet
 * @internal true
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; copyName: string }> => {
  const { spreadsheetId, sheetName, copyName } = props;

  try {
    const spreadsheet = await ctx.invoke["google-sheets"].loaders
      .getSpreadsheet({ spreadsheetId });
    const sourceSheet = spreadsheet.sheets?.find((sheet) =>
      sheet.title === sheetName
    );

    if (!sourceSheet || sourceSheet.id === undefined) {
      const availableSheets = spreadsheet.sheets
        ?.map((s) => s.title)
        .filter(Boolean)
        .join(", ");

      ctx.errorHandler.toHttpError(
        `Aba "${sheetName}" não encontrada. Abas disponíveis: ${availableSheets}`,
      );
    }

    const sourceSheetId = sourceSheet.id;
    const expectedCopyName = copyName || `Cópia de ${sheetName}`;

    const accessToken = ctx.tokens?.access_token;

    if (!accessToken) {
      ctx.errorHandler.toHttpError("Token de acesso não disponível");
    }

    const copyToUrl =
      `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}/sheets/${sourceSheetId}:copyTo`;

    const copyResponse = await fetch(copyToUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationSpreadsheetId: spreadsheetId,
      }),
    });

    if (!copyResponse.ok) {
      throw new Error(`Erro ao copiar aba: ${copyResponse.statusText}`);
    }

    return {
      success: true,
      copyName: expectedCopyName,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Erro ao copiar aba");
    return {
      success: false,
      copyName: "",
    };
  }
};

export default action;
