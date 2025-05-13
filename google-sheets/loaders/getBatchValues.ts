import { AppContext } from "../mod.ts";
import { ValueRange } from "../utils/types.ts";

export interface Props {
  /**
   * @title ID da Planilha
   * @description O ID da planilha do Google Sheets
   */
  spreadsheetId: string;

  /**
   * @title Intervalos
   * @description Lista de intervalos de células na notação A1 (ex: ["Sheet1!A1:B10", "Sheet2!C3:D4"])
   */
  ranges: string[];

  /**
   * @title Dimensão Principal
   * @description Determina a ordenação dos valores retornados
   * @default "ROWS"
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Opção de Renderização de Valores
   * @description Como os valores devem ser representados
   * @default "FORMATTED_VALUE"
   */
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";

  /**
   * @title Opção de Renderização de Data/Hora
   * @description Como os valores de data e hora devem ser representados
   * @default "SERIAL_NUMBER"
   */
  dateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";

  /**
   * @title Token de Autenticação
   * @description O token de autenticação para acessar o Google Sheets
   */
  token: string;
}

/**
 * @title Obter Valores em Lote
 * @description Lê os valores de múltiplos intervalos de células de uma planilha do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<{ valueRanges: ValueRange[] }> => {
  const {
    spreadsheetId,
    ranges,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
    token,
  } = props;

  try {
    const url = new URL(
      `/v4/spreadsheets/${spreadsheetId}/values:batchGet`,
      "https://sheets.googleapis.com",
    );

    // Adiciona os parâmetros de consulta
    url.searchParams.append("majorDimension", majorDimension);
    url.searchParams.append("valueRenderOption", valueRenderOption);
    url.searchParams.append("dateTimeRenderOption", dateTimeRenderOption);

    // Adiciona os intervalos como parâmetros de consulta
    for (const range of ranges) {
      url.searchParams.append("ranges", range);
    }

    // Faz a requisição com o token de acesso
    const response = await fetch(url.toString(), {
      headers: new Headers({
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao obter valores em lote: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter valores em lote:", error);
    throw error;
  }
};

export default loader;
