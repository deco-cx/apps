import { AppContext } from "../mod.ts";
import type { UpdateValuesResponse, ValueRange } from "../utils/types.ts";

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
   * @description Os valores a serem gravados na planilha como uma matriz
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
 * @title Atualizar Valores
 * @description Atualiza os valores de células em uma planilha do Google Sheets
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
    includeValuesInResponse = false,
    responseValueRenderOption = "FORMATTED_VALUE",
    responseDateTimeRenderOption = "SERIAL_NUMBER",
    token,
  } = props;

  try {
    // Verificar se os valores estão em formato válido antes de enviar
    const validatedValues = values.map((row) =>
      row.map((cell) => {
        if (cell === null || cell === undefined) return "";
        if (typeof cell === "object" && Object.keys(cell).length === 0) {
          return "";
        }
        return cell;
      })
    );

    // Preparando o corpo da requisição
    const body: ValueRange = {
      range,
      majorDimension,
      values: validatedValues,
    };

    // Constrói os parâmetros para a chamada
    // deno-lint-ignore no-explicit-any
    const params: Record<string, any> = {
      spreadsheetId,
      range: encodeURIComponent(range),
      valueInputOption,
    };

    if (includeValuesInResponse) {
      params.includeValuesInResponse = true;
      params.responseValueRenderOption = responseValueRenderOption;
      params.responseDateTimeRenderOption = responseDateTimeRenderOption;
    }

    // Faz a requisição usando o clientSheets
    const updateResponse = await ctx.client
      ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
        {
          spreadsheetId,
          range: encodeURIComponent(range),
          valueInputOption,
          ...(includeValuesInResponse
            ? {
              includeValuesInResponse,
              responseValueRenderOption,
              responseDateTimeRenderOption,
            }
            : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body,
        },
      );

    return await updateResponse.json();
  } catch (error) {
    console.error("Erro ao atualizar valores:", error);
    throw error;
  }
};

export default action;
