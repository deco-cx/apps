import { AppContext } from "../mod.ts";
import { ValueRange } from "../utils/types.ts";

export interface Props {
  /**
   * @title ID da Planilha
   * @description O ID da planilha do Google Sheets
   */
  spreadsheetId: string;

  /**
   * @title Intervalo
   * @description O intervalo de células na notação A1 (ex: "Sheet1!A1:B10")
   */
  range: string;

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
 * @title Obter Valores
 * @description Lê os valores de células de uma planilha do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ValueRange> => {
  const {
    spreadsheetId,
    range,
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

    // Constrói a URL com os parâmetros de pesquisa
    const url = new URL(
      `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
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
          `Erro ao obter valores: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    }

    // Usa o cliente HTTP configurado com token de acesso
    const urlWithParams = new URL(
      `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      "https://sheets.googleapis.com",
    );
    urlWithParams.searchParams.append("majorDimension", majorDimension);
    urlWithParams.searchParams.append("valueRenderOption", valueRenderOption);
    urlWithParams.searchParams.append(
      "dateTimeRenderOption",
      dateTimeRenderOption,
    );

    const response = await fetch(urlWithParams.toString(), {
      headers: new Headers({
        "Authorization": `Bearer ${ctx.accessToken}`,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao obter valores: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter valores:", error);
    throw error;
  }
};

export default loader;
