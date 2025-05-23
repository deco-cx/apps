import { AppContext } from "../mod.ts";
import type {
  SimpleBatchUpdateProps,
  SimpleBatchUpdateResponse,
  SimpleError,
  SimpleValueRange,
  Result,
} from "../@types.ts";
import {
  mapSimpleBatchUpdatePropsToApi,
  mapApiBatchUpdateResponseToSimple,
  parseApiErrorText,
  validateSimpleBatchUpdateProps,
} from "../utils/mappers.ts";

/**
 * Dados de um range individual para atualização em lote
 */
export interface BatchUpdateData {
  /**
   * @title Range de Células
   * @description Range das células a atualizar em notação A1. Pode ser uma célula única ou um intervalo.
   * @examples ["A1", "Sheet1!A1", "A1:B10", "Dados!C2:E5"]
   */
  range: string;

  /**
   * @title Dados da Tabela
   * @description Array 2D de valores para este range específico. Cada sub-array representa uma linha. Suporta: string, number, boolean, null.
   * @examples [
   *   [["Nome", "Idade"]],
   *   [["João", 25], ["Maria", 30]]
   * ]
   */
  // deno-lint-ignore no-explicit-any
  values: any[][];

  /**
   * @title Organização dos Dados
   * @description Como interpretar a matriz de dados para este range. ROWS = cada inner array é uma linha, COLUMNS = cada inner array é uma coluna
   * @default "ROWS"
   */
  majorDimension?: "ROWS" | "COLUMNS";
}

/**
 * Props para atualização em lote simplificada
 */
export interface Props {
  /**
   * @title Spreadsheet ID
   * @description ID único da planilha Google Sheets. Encontrado na URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   * @pattern ^[a-zA-Z0-9-_]+$
   */
  spreadsheetId: string;

  /**
   * @title Dados de Atualização em Lote
   * @description Array de ranges e seus valores correspondentes para atualizar. Cada elemento atualiza um range diferente na planilha.
   * @minItems 1
   * @maxItems 100
   * @examples [
   *   [{"range": "A1", "values": [["Título"]]}, {"range": "C1", "values": [["Data"]]}],
   *   [{"range": "Sheet1!A1:B2", "values": [["Nome", "Idade"], ["João", 25]]}, {"range": "Sheet2!A1", "values": [["Total"]]}]
   * ]
   */
  data: BatchUpdateData[];

  /**
   * @title Modo de Entrada
   * @description Como interpretar TODOS os valores de entrada em todos os ranges:
   * - RAW: Valores armazenados exatamente como inseridos (apenas strings)
   * - USER_ENTERED: Interpreta valores como se digitados pelo usuário (fórmulas, números, datas convertidos automaticamente)
   * @default "USER_ENTERED"
   */
  valueInputOption?: "RAW" | "USER_ENTERED";

  /**
   * @title Incluir Valores na Resposta
   * @description Se deve retornar os valores atualizados na resposta da API. Útil para confirmação.
   * @default false
   */
  includeValuesInResponse?: boolean;

  /**
   * @title Formato da Resposta
   * @description Como formatar valores na resposta (apenas se includeValuesInResponse=true):
   * - FORMATTED_VALUE: Como aparecem na UI (ex: "R$ 1.000,00")
   * - UNFORMATTED_VALUE: Valores calculados brutos (ex: 1000)
   * - FORMULA: As fórmulas (ex: "=SOMA(A1:A10)")
   * @default "FORMATTED_VALUE"
   */
  responseValueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";

  /**
   * @title Formato de Data/Hora na Resposta
   * @description Como formatar datas na resposta (apenas se includeValuesInResponse=true):
   * - FORMATTED_STRING: Formato legível (ex: "1 Set 2008 15:00:00")
   * - SERIAL_NUMBER: Número serial do Excel (ex: 39682.625)
   * @default "SERIAL_NUMBER"
   */
  responseDateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * @title Atualização em Lote de Valores da Planilha
 * @description Atualiza múltiplos ranges SEPARADOS de células em uma planilha Google Sheets em uma única chamada da API. Mais eficiente que múltiplas atualizações individuais.
 * 
 * **Exemplos de uso:**
 * - Múltiplas células: `data: [{"range": "A1", "values": [["Nome"]]}, {"range": "C1", "values": [["Idade"]]}]`
 * - Diferentes sheets: `data: [{"range": "Sheet1!A1", "values": [["Dados"]]}, {"range": "Sheet2!A1", "values": [["Resumo"]]}]`
 * - Dashboard: `data: [{"range": "A1:B1", "values": [["KPI", "Valor"]]}, {"range": "A5:C7", "values": [["Produto", "Vendas", "Meta"], ["Mouse", 100, 120], ["Teclado", 80, 90]]}]`
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result<SimpleBatchUpdateResponse>> => {
  // Converter props para formato simplificado
  const simpleData: SimpleValueRange[] = props.data.map(item => ({
    range: item.range,
    values: item.values,
    majorDimension: item.majorDimension,
  }));

  const simpleProps: SimpleBatchUpdateProps = {
    spreadsheetId: props.spreadsheetId,
    data: simpleData,
    valueInputOption: props.valueInputOption,
    includeValuesInResponse: props.includeValuesInResponse,
    responseValueRenderOption: props.responseValueRenderOption,
    responseDateTimeRenderOption: props.responseDateTimeRenderOption,
  };

  // Validar entrada
  const validationErrors = validateSimpleBatchUpdateProps(simpleProps);
  if (validationErrors.length > 0) {
    return {
      message: `Erro de validação: ${validationErrors.join(", ")}`,
    } as SimpleError;
  }

  try {
    // Mapear para formato da API
    const { body, params } = mapSimpleBatchUpdatePropsToApi(simpleProps);

    // Fazer chamada para API
    const response = await ctx.client
      ["POST /v4/spreadsheets/:spreadsheetId/values:batchUpdate"](
        params,
        { body },
      );

    if (!response.ok) {
      const errorText = await response.text();
      return parseApiErrorText(errorText);
    }

    // Mapear resposta da API para formato simples
    const apiResponse = await response.json();
    return mapApiBatchUpdateResponseToSimple(apiResponse);

  } catch (error) {
    return {
      message: `Erro na comunicação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      details: { originalError: error },
    } as SimpleError;
  }
};

export default action;
