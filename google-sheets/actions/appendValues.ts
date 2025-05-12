import { AppContext } from "../mod.ts";
import { UpdateValuesResponse, ValueRange } from "../utils/types.ts";

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
   * @title Valores
   * @description Os valores a serem adicionados na planilha como uma matriz
   */
  values: unknown[][];

  /**
   * @title Dimensão Principal
   * @description Determina como organizar os valores na matriz (por linhas ou colunas)
   * @default "ROWS"
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Opção de Entrada de Valor
   * @description Como interpretar os valores de entrada
   * @default "USER_ENTERED"
   */
  valueInputOption?: "RAW" | "USER_ENTERED";

  /**
   * @title Opção de Inserção de Dados
   * @description Como os dados devem ser inseridos
   * @default "INSERT_ROWS"
   */
  insertDataOption?: "OVERWRITE" | "INSERT_ROWS";

  /**
   * @title Incluir Valores na Resposta
   * @description Se a resposta deve incluir os valores atualizados
   * @default false
   */
  includeValuesInResponse?: boolean;

  /**
   * @title Opção de Renderização de Valores na Resposta
   * @description Como os valores devem ser representados na resposta
   * @default "FORMATTED_VALUE"
   */
  responseValueRenderOption?:
    | "FORMATTED_VALUE"
    | "UNFORMATTED_VALUE"
    | "FORMULA";

  /**
   * @title Opção de Renderização de Data/Hora na Resposta
   * @description Como os valores de data e hora devem ser representados na resposta
   * @default "SERIAL_NUMBER"
   */
  responseDateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * @title Adicionar Valores
 * @description Adiciona valores ao final de um intervalo em uma planilha do Google Sheets
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateValuesResponse> => {
  const {
    spreadsheetId,
    range,
    values,
    majorDimension = "ROWS",
    valueInputOption = "USER_ENTERED",
    insertDataOption = "INSERT_ROWS",
    includeValuesInResponse = false,
    responseValueRenderOption = "FORMATTED_VALUE",
    responseDateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  try {
    // Preparando o corpo da requisição
    const body: ValueRange = {
      range,
      majorDimension,
      values,
    };

    // Adiciona o API Key se estiver disponível
    const searchParams = new URLSearchParams();
    if (ctx.apiKey) {
      searchParams.append("key", ctx.apiKey);
    }

    // Adiciona os parâmetros de consulta
    searchParams.append("valueInputOption", valueInputOption);
    searchParams.append("insertDataOption", insertDataOption);
    if (includeValuesInResponse) {
      searchParams.append("includeValuesInResponse", "true");
      searchParams.append(
        "responseValueRenderOption",
        responseValueRenderOption,
      );
      searchParams.append(
        "responseDateTimeRenderOption",
        responseDateTimeRenderOption,
      );
    }

    // Constrói a URL para adicionar os valores
    const url = new URL(
      `/v4/spreadsheets/${spreadsheetId}/values/${
        encodeURIComponent(range)
      }:append`,
      "https://sheets.googleapis.com",
    );
    for (const [key, value] of searchParams.entries()) {
      url.searchParams.append(key, value);
    }

    // Se não tiver token de acesso OAuth, não pode adicionar valores com apenas API Key
    if (!ctx.accessToken) {
      throw new Error(
        "Token de acesso OAuth necessário para adicionar valores",
      );
    }

    // Faz a requisição para adicionar os valores
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ctx.accessToken}`,
      }),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro ao adicionar valores: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao adicionar valores:", error);
    throw error;
  }
};

export default action;
