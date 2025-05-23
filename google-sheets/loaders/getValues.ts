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
   * @description O intervalo de células na notação A1 (ex: Sheet1!A1:B10) sem as aspas
   */
  range: string;

  /**
   * @title Dimensão Principal
   * @description Determina como organizar os valores na matriz (por linhas ou colunas)
   * @default "ROWS"
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Opção de Renderização de Valores
   * @description Como os valores devem ser representados na resposta
   * @default "FORMATTED_VALUE"
   */
  valueRenderOption?:
    | "FORMATTED_VALUE"
    | "UNFORMATTED_VALUE"
    | "FORMULA";

  /**
   * @title Opção de Renderização de Data/Hora
   * @description Como os valores de data e hora devem ser representados na resposta
   * @default "SERIAL_NUMBER"
   */
  dateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * @title Obter Valores
 * @description Obtém os valores de um intervalo específico de células da planilha
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

  const response = await ctx.client
    ["GET /v4/spreadsheets/:spreadsheetId/values/:range"](
      {
        spreadsheetId,
        range: range,
        majorDimension,
        valueRenderOption,
        dateTimeRenderOption,
      },
    );

  const data = await response.json();
  return data;
};

export default loader;
