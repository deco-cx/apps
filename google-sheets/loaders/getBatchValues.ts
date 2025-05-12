import { AppContext } from "../mod.ts";
import { ValueRange } from "../utils/client.ts";

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
}

/**
 * @title Obter Valores em Lote
 * @description Lê os valores de múltiplos intervalos de células de uma planilha do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ valueRanges: ValueRange[] }> => {
  const {
    spreadsheetId,
    ranges,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  try {
    // Adiciona o API Key se estiver disponível
    const searchParams = new URLSearchParams();
    if (ctx.apiKey) {
      searchParams.append("key", ctx.apiKey);
    }

    // Adiciona os parâmetros de consulta
    searchParams.append("majorDimension", majorDimension);
    searchParams.append("valueRenderOption", valueRenderOption);
    searchParams.append("dateTimeRenderOption", dateTimeRenderOption);

    // Adiciona os intervalos como parâmetros de consulta
    for (const range of ranges) {
      searchParams.append("ranges", range);
    }

    // Constrói a URL para obter os valores
    const url = new URL(
      `/v4/spreadsheets/${spreadsheetId}/values:batchGet`,
      "https://sheets.googleapis.com",
    );
    for (const [key, value] of searchParams.entries()) {
      url.searchParams.append(key, value);
    }

    // Faz a requisição diretamente se estiver usando API Key
    // ou se o token de acesso não estiver disponível
    if (ctx.apiKey && !ctx.accessToken) {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Erro ao obter valores em lote: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    }

    // Monta cabeçalhos para a requisição com token de acesso
    const headers = new Headers();
    if (ctx.accessToken) {
      headers.set("Authorization", `Bearer ${ctx.accessToken}`);
    }

    // Faz a requisição para obter os valores em lote
    const response = await fetch(url.toString(), { headers });

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
