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
  } = props;

  const validatedValues = values.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) return "";
      if (typeof cell === "object" && Object.keys(cell).length === 0) {
        return "";
      }
      return cell;
    })
  );

  const body: ValueRange = {
    range,
    majorDimension,
    values: validatedValues,
  };

  const response = await ctx.client
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
      { body },
    );

  return await response.json();
};

export default action;
