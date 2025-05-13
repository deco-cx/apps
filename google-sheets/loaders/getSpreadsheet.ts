import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
  /**
   * @title ID da Planilha
   * @description O ID da planilha do Google Sheets a ser obtida
   */
  spreadsheetId: string;

  /**
   * @title Token de Autenticação
   * @description O token de autenticação para acessar o Google Sheets
   */
  token: string;
}

/**
 * @title Obter Planilha
 * @description Obtém os metadados de uma planilha do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<Spreadsheet> => {
  const { spreadsheetId, token } = props;

  try {
    const url = new URL(
      `/v4/spreadsheets/${spreadsheetId}`,
      "https://sheets.googleapis.com",
    );

    const response = await fetch(url.toString(), {
      headers: new Headers({
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao obter planilha: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter planilha:", error);
    throw error;
  }
};

export default loader;
