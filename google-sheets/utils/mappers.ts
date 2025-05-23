/**
 * Utilitários para mapear entre tipos simplificados e tipos oficiais da Google API
 */

import type {
  CellValue,
  TableData,
  SimpleValueRange,
  SimpleUpdateProps,
  SimpleBatchUpdateProps,
  SimpleUpdateResponse,
  SimpleBatchUpdateResponse,
  SimpleError,
} from "../@types.ts";

import type {
  ValueRange,
  BatchUpdateValuesRequest,
  UpdateValuesResponse,
  BatchUpdateValuesResponse,
} from "./types.ts";

// ============================================================================
// MAPEADORES DE ENTRADA (Simple -> API)
// ============================================================================

/**
 * Limpa e valida um valor de célula
 */
export function cleanCellValue(value: CellValue): string | number | boolean {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  return String(value);
}

/**
 * Converte dados tabulares simples para formato da API
 */
export function mapTableDataToApiValues(data: TableData): (string | number | boolean)[][] {
  return data.map(row => 
    row.map(cell => cleanCellValue(cell))
  );
}

/**
 * Converte SimpleValueRange para ValueRange da API
 */
export function mapSimpleValueRangeToApi(simple: SimpleValueRange): ValueRange {
  return {
    range: simple.range,
    majorDimension: simple.majorDimension || "ROWS",
    values: mapTableDataToApiValues(simple.values),
  };
}

/**
 * Converte props simples para formato da API updateValues
 */
export function mapSimpleUpdatePropsToApi(props: SimpleUpdateProps): {
  body: ValueRange;
  params: {
    spreadsheetId: string;
    range: string;
    valueInputOption: string;
    includeValuesInResponse?: boolean;
    responseValueRenderOption?: string;
    responseDateTimeRenderOption?: string;
  };
} {
  const body: ValueRange = {
    range: props.range,
    majorDimension: "ROWS",
    values: mapTableDataToApiValues(props.values),
  };

  const params = {
    spreadsheetId: props.spreadsheetId,
    range: props.range,
    valueInputOption: props.valueInputOption || "USER_ENTERED",
    ...(props.includeValuesInResponse && {
      includeValuesInResponse: true,
      responseValueRenderOption: props.responseValueRenderOption || "FORMATTED_VALUE",
      responseDateTimeRenderOption: props.responseDateTimeRenderOption || "SERIAL_NUMBER",
    }),
  };

  return { body, params };
}

/**
 * Converte props simples para formato da API batchUpdate
 */
export function mapSimpleBatchUpdatePropsToApi(props: SimpleBatchUpdateProps): {
  body: BatchUpdateValuesRequest;
  params: {
    spreadsheetId: string;
  };
} {
  const body: BatchUpdateValuesRequest = {
    valueInputOption: props.valueInputOption || "USER_ENTERED",
    includeValuesInResponse: props.includeValuesInResponse || false,
    data: props.data.map(item => mapSimpleValueRangeToApi(item)),
  };

  if (props.includeValuesInResponse) {
    body.responseValueRenderOption = props.responseValueRenderOption || "FORMATTED_VALUE";
    body.responseDateTimeRenderOption = props.responseDateTimeRenderOption || "SERIAL_NUMBER";
  }

  const params = {
    spreadsheetId: props.spreadsheetId,
  };

  return { body, params };
}

// ============================================================================
// MAPEADORES DE SAÍDA (API -> Simple)
// ============================================================================

/**
 * Converte valores da API para dados tabulares simples
 */
export function mapApiValuesToTableData(values?: (string | number | boolean)[][]): TableData {
  if (!values) return [];
  return values.map(row => 
    row.map(cell => cell as CellValue)
  );
}

/**
 * Converte ValueRange da API para SimpleValueRange
 */
export function mapApiValueRangeToSimple(apiRange: ValueRange): SimpleValueRange {
  return {
    range: apiRange.range || "",
    values: mapApiValuesToTableData(apiRange.values),
    majorDimension: (apiRange.majorDimension as "ROWS" | "COLUMNS") || "ROWS",
  };
}

/**
 * Converte resposta da API updateValues para formato simples
 */
export function mapApiUpdateResponseToSimple(
  apiResponse: UpdateValuesResponse
): SimpleUpdateResponse {
  return {
    spreadsheetId: apiResponse.spreadsheetId || "",
    updatedRange: apiResponse.updatedRange || "",
    updatedRows: apiResponse.updatedRows || 0,
    updatedColumns: apiResponse.updatedColumns || 0,
    updatedCells: apiResponse.updatedCells || 0,
    updatedData: apiResponse.updatedData 
      ? mapApiValueRangeToSimple(apiResponse.updatedData)
      : undefined,
  };
}

/**
 * Converte resposta da API batchUpdate para formato simples
 */
export function mapApiBatchUpdateResponseToSimple(
  apiResponse: BatchUpdateValuesResponse
): SimpleBatchUpdateResponse {
  return {
    spreadsheetId: apiResponse.spreadsheetId || "",
    totalUpdatedRanges: apiResponse.responses?.length || 0,
    totalUpdatedRows: apiResponse.totalUpdatedRows || 0,
    totalUpdatedColumns: apiResponse.totalUpdatedColumns || 0,
    totalUpdatedCells: apiResponse.totalUpdatedCells || 0,
    responses: (apiResponse.responses || []).map(response => 
      mapApiUpdateResponseToSimple(response)
    ),
  };
}

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================

/**
 * Converte erro da API para formato simples
 */
export function mapApiErrorToSimple(error: unknown): SimpleError {
  if (typeof error === "string") {
    return { message: error };
  }

  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    
    return {
      code: errorObj.code as string,
      message: errorObj.message as string || "Erro desconhecido",
      details: errorObj,
    };
  }

  return {
    message: "Erro desconhecido",
    details: { originalError: error },
  };
}

/**
 * Tenta fazer parse de um erro de texto da API
 */
export function parseApiErrorText(errorText: string): SimpleError {
  try {
    const parsed = JSON.parse(errorText);
    return mapApiErrorToSimple(parsed);
  } catch {
    return {
      message: errorText || "Erro na comunicação com a API",
    };
  }
}

// ============================================================================
// VALIDADORES
// ============================================================================

/**
 * Valida se um range está no formato correto
 */
export function validateRange(range: string): boolean {
  // Padrão: Sheet1!A1, A1:B10, Sheet1!A1:B10, etc.
  const rangePattern = /^([^!]*!)?[A-Z]+[0-9]+(:[A-Z]+[0-9]+)?$/;
  return rangePattern.test(range);
}

/**
 * Valida se os dados da tabela são válidos
 */
export function validateTableData(data: TableData): boolean {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true; // Array vazio é válido
  
  // Verifica se todas as linhas são arrays
  return data.every(row => Array.isArray(row));
}

/**
 * Valida props de atualização simples
 */
export function validateSimpleUpdateProps(props: SimpleUpdateProps): string[] {
  const errors: string[] = [];

  if (!props.spreadsheetId) {
    errors.push("spreadsheetId é obrigatório");
  }

  if (!props.range) {
    errors.push("range é obrigatório");
  } else if (!validateRange(props.range)) {
    errors.push("range deve estar no formato A1 ou A1:B10");
  }

  if (!props.values) {
    errors.push("values é obrigatório");
  } else if (!validateTableData(props.values)) {
    errors.push("values deve ser um array de arrays");
  }

  return errors;
}

/**
 * Valida props de atualização em lote
 */
export function validateSimpleBatchUpdateProps(props: SimpleBatchUpdateProps): string[] {
  const errors: string[] = [];

  if (!props.spreadsheetId) {
    errors.push("spreadsheetId é obrigatório");
  }

  if (!props.data || !Array.isArray(props.data)) {
    errors.push("data deve ser um array");
  } else {
    if (props.data.length === 0) {
      errors.push("data não pode ser vazio");
    }

    if (props.data.length > 100) {
      errors.push("data não pode ter mais de 100 ranges");
    }

    props.data.forEach((item, index) => {
      if (!item.range) {
        errors.push(`data[${index}].range é obrigatório`);
      } else if (!validateRange(item.range)) {
        errors.push(`data[${index}].range deve estar no formato A1 ou A1:B10`);
      }

      if (!item.values) {
        errors.push(`data[${index}].values é obrigatório`);
      } else if (!validateTableData(item.values)) {
        errors.push(`data[${index}].values deve ser um array de arrays`);
      }
    });
  }

  return errors;
} 