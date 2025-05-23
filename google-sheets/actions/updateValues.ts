import { AppContext } from "../mod.ts";
import type {
  SimpleUpdateProps,
  SimpleUpdateResponse,
  SimpleError,
  Result,
} from "../@types.ts";
import {
  mapSimpleUpdatePropsToApi,
  mapApiUpdateResponseToSimple,
  parseApiErrorText,
  validateSimpleUpdateProps,
} from "../utils/mappers.ts";

/**
 * Props para atualização de valores simplificada
 */
export interface Props {
  /**
   * @title Spreadsheet ID
   * @description ID único da planilha Google Sheets. Encontrado na URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   * @pattern ^[a-zA-Z0-9-_]+$
   */
  spreadsheetId: string;

  /**
   * @title Range de Células
   * @description Range das células a atualizar em notação A1. Pode ser uma célula única ou um intervalo.
   * @examples ["A1", "Sheet1!A1", "A1:B10", "Dados!C2:E5"]
   */
  range: string;

  /**
   * @title Dados da Tabela
   * @description Array 2D de valores para escrever na planilha. Cada sub-array representa uma linha. Suporta: string, number, boolean, null.
   * @examples [
   *   [["Nome", "Idade"], ["João", 25], ["Maria", 30]],
   *   [["Produto", "Preço", "Estoque"], ["Mouse", 50, 100], ["Teclado", 150, 50]]
   * ]
   */
  // deno-lint-ignore no-explicit-any
  values: any[][];

  /**
   * @title Modo de Entrada
   * @description Como interpretar os valores de entrada:
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
 * @title Atualizar Valores da Planilha
 * @description Atualiza valores de células em uma planilha Google Sheets. Use para escrever dados em um ÚNICO range de células.
 * 
 * **Exemplos de uso:**
 * - Célula única: `range: "A1"`, `values: [["João"]]`
 * - Linha: `range: "A1:C1"`, `values: [["Nome", "Idade", "Cidade"]]`
 * - Tabela: `range: "A1:C3"`, `values: [["Nome", "Idade"], ["João", 25], ["Maria", 30]]`
 * - Com sheet: `range: "Dados!A1:B2"`, `values: [["Item", "Valor"], ["Mouse", 50]]`
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result<SimpleUpdateResponse>> => {
  // Converter props para formato simplificado
  const simpleProps: SimpleUpdateProps = {
    spreadsheetId: props.spreadsheetId,
    range: props.range,
    values: props.values,
    valueInputOption: props.valueInputOption,
    includeValuesInResponse: props.includeValuesInResponse,
    responseValueRenderOption: props.responseValueRenderOption,
    responseDateTimeRenderOption: props.responseDateTimeRenderOption,
  };

  // Validar entrada
  const validationErrors = validateSimpleUpdateProps(simpleProps);
  if (validationErrors.length > 0) {
    return {
      message: `Erro de validação: ${validationErrors.join(", ")}`,
    } as SimpleError;
  }

  try {
    // Mapear para formato da API
    const { body, params } = mapSimpleUpdatePropsToApi(simpleProps);

    // Fazer chamada para API
    const response = await ctx.client
      ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
        params,
        { body },
      );

    if (!response.ok) {
      const errorText = await response.text();
      return parseApiErrorText(errorText);
    }

    // Mapear resposta da API para formato simples
    const apiResponse = await response.json();
    return mapApiUpdateResponseToSimple(apiResponse);

  } catch (error) {
    return {
      message: `Erro na comunicação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      details: { originalError: error },
    } as SimpleError;
  }
};

export default action;
