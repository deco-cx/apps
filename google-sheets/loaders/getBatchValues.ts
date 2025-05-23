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

  const valueRanges: ValueRange[] = [];

  for (const range of ranges) {
    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId/values/:range"](
        {
          spreadsheetId,
          range,
          majorDimension,
          valueRenderOption,
          dateTimeRenderOption,
        },
      );

    const data = await response.json();
    valueRanges.push(data);
  }

  return { valueRanges };
};

export default loader;
