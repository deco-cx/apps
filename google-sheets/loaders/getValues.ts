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

  /**
   * @title Token de Autenticação
   * @description O token de autenticação para acessar o Google Sheets
   */
  token: string;
}

/**
 * @title Obter Valores
 * @description Lê os valores de células de uma planilha do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<ValueRange> => {
  const {
    spreadsheetId,
    range,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  try {
    const url = new URL(
      `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      "https://sheets.googleapis.com",
    );

    // Adiciona os parâmetros de consulta
    url.searchParams.append("majorDimension", majorDimension);
    url.searchParams.append("valueRenderOption", valueRenderOption);
    url.searchParams.append("dateTimeRenderOption", dateTimeRenderOption);

    const response = await fetch(url.toString(), {
      headers: new Headers({
        "Authorization": `Bearer ${props.token}`,
        "Accept": "application/json",
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
