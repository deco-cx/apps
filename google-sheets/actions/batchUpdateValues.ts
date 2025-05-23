import { AppContext } from "../mod.ts";
import {
  BatchUpdateValuesRequest,
  BatchUpdateValuesResponse,
} from "../utils/types.ts";

export interface Props {
  /**
   * @title ID da Planilha
   * @description O ID da planilha do Google Sheets
   */
  spreadsheetId: string;

  /**
   * @title Dados
   * @description Matriz de dados a serem atualizados, cada elemento deve conter um intervalo e valores
   */
  data: Array<{
    /**
     * @title Intervalo
     * @description O intervalo de células na notação A1 (ex: "Sheet1!A1:B10")
     */
    range: string;

    /**
     * @title Valores
     * @description Os valores a serem gravados na planilha como uma matriz
     */
    values: unknown[][];

    /**
     * @title Dimensão Principal
     * @description Determina como organizar os valores na matriz (por linhas ou colunas)
     * @default "ROWS"
     */
    majorDimension?: "ROWS" | "COLUMNS";
  }>;

  /**
   * @title Opção de Entrada de Valor
   * @description Como interpretar os valores de entrada
   * @default "USER_ENTERED"
   */
  valueInputOption?: "RAW" | "USER_ENTERED";

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
 * @title Atualizar Valores em Lote
 * @description Atualiza os valores de múltiplos intervalos de células em uma planilha do Google Sheets
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BatchUpdateValuesResponse | { error: string }> => {
  const {
    spreadsheetId,
    data,
    valueInputOption = "USER_ENTERED",
    includeValuesInResponse = false,
    responseValueRenderOption = "FORMATTED_VALUE",
    responseDateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  const { client } = ctx;

  const requestBody: BatchUpdateValuesRequest = {
    valueInputOption,
    includeValuesInResponse,
    responseValueRenderOption: includeValuesInResponse
      ? responseValueRenderOption
      : undefined,
    responseDateTimeRenderOption: includeValuesInResponse
      ? responseDateTimeRenderOption
      : undefined,
    data: data.map((item) => ({
      range: item.range,
      majorDimension: item.majorDimension || "ROWS",
      values: item.values,
    })),
  };

  const response = await client
    ["POST /v4/spreadsheets/:spreadsheetId/values:batchUpdate"](
      { spreadsheetId },
      { body: requestBody },
    );

  if (!response.ok) {
    const errorText = await response.text();
    return {
      error: errorText,
    };
  }

  return await response.json();
};

export default action;
