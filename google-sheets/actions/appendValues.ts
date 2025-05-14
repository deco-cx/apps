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

  /**
   * @title Token de Autenticação
   * @description O token de autenticação para acessar o Google Sheets
   */
  token: string;
}

/**
 * @title Adicionar Valores
 * @description Adiciona valores ao final de um intervalo em uma planilha do Google Sheets
 */
const action = async (
  props: Props,
  _req: Request,
  _ctx: AppContext,
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
    token,
  } = props;

  try {
    // Preparando o corpo da requisição
    const body: ValueRange = {
      range,
      majorDimension,
      values,
    };

    // Constrói a URL para adicionar os valores
    const url = new URL(
      `/v4/spreadsheets/${spreadsheetId}/values/${
        encodeURIComponent(range)
      }:append`,
      "https://sheets.googleapis.com",
    );

    // Adiciona os parâmetros de consulta
    url.searchParams.append("valueInputOption", valueInputOption);
    url.searchParams.append("insertDataOption", insertDataOption);
    if (includeValuesInResponse) {
      url.searchParams.append("includeValuesInResponse", "true");
      url.searchParams.append(
        "responseValueRenderOption",
        responseValueRenderOption,
      );
      url.searchParams.append(
        "responseDateTimeRenderOption",
        responseDateTimeRenderOption,
      );
    }

    // Faz a requisição para adicionar os valores
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
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
