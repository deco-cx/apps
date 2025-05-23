import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
  /**
   * @title Título da Planilha
   * @description O título para a nova planilha
   */
  title: string;

  /**
   * @title Locale
   * @description O código de localização para a planilha
   * @default "pt_BR"
   */
  locale?: string;

  /**
   * @title Fuso Horário
   * @description O fuso horário da planilha
   * @default "America/Sao_Paulo"
   */
  timeZone?: string;

  /**
   * @title Auto Recalcular
   * @description Quando as fórmulas devem ser recalculadas
   * @default "ON_CHANGE"
   */
  autoRecalc?: "ON_CHANGE" | "MINUTE" | "HOUR";

  /**
   * @title Folhas Iniciais
   * @description Configuração das folhas iniciais da planilha
   */
  sheets?: Array<{
    /**
     * @title Título da Folha
     * @description Título da folha a ser criada
     */
    title: string;

    /**
     * @title Número de Linhas
     * @description Número de linhas na folha
     * @default 1000
     */
    rowCount?: number;

    /**
     * @title Número de Colunas
     * @description Número de colunas na folha
     * @default 26
     */
    columnCount?: number;
  }>;
}

/**
 * @title Criar Planilha
 * @description Cria uma nova planilha no Google Sheets
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Spreadsheet | { error: string }> => {
  const {
    title,
    locale = "pt_BR",
    timeZone = "America/Sao_Paulo",
    autoRecalc = "ON_CHANGE",
    sheets = [{ title: "Sheet1", rowCount: 1000, columnCount: 26 }],
  } = props;

  const { client } = ctx;

  const requestBody = {
    properties: {
      title,
      locale,
      timeZone,
      autoRecalc,
    },
    sheets: sheets.map((sheet) => ({
      properties: {
        title: sheet.title,
        gridProperties: {
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount,
        },
      },
    })),
  };

  const response = await client["POST /v4/spreadsheets"]({}, {
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      error: errorText,
    };
  }

  return await response.json();
};

export default action;
