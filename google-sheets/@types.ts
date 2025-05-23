/**
 * Tipos simplificados para facilitar o uso da Google Sheets API
 * Estes tipos são mais user-friendly e depois são mapeados para os tipos oficiais da API
 */

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

/**
 * Valor de célula simplificado - aceita os tipos mais comuns
 */
export type CellValue = string | number | boolean | null | undefined;

/**
 * Linha de dados - array de valores de célula
 */
export type Row = CellValue[];

/**
 * Dados tabulares - array de linhas
 */
export type TableData = Row[];

/**
 * Range simples - string em notação A1
 * Exemplos: "A1", "Sheet1!A1", "A1:B10", "Data!C2:E5"
 */
export type SimpleRange = string;

/**
 * ID da planilha - string alfanumérica
 */
export type SpreadsheetId = string;

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

/**
 * Range de valores simplificado
 */
export interface SimpleValueRange {
  /** Range em notação A1 */
  range: SimpleRange;
  /** Dados da tabela */
  values: TableData;
  /** Como interpretar os dados (padrão: ROWS) */
  majorDimension?: "ROWS" | "COLUMNS";
}

/**
 * Configurações de entrada de dados
 */
export interface InputOptions {
  /** Como interpretar os valores de entrada */
  valueInputOption?: "RAW" | "USER_ENTERED";
  /** Incluir valores atualizados na resposta */
  includeValuesInResponse?: boolean;
  /** Formato dos valores na resposta */
  responseValueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";
  /** Formato de data/hora na resposta */
  responseDateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * Props simplificadas para atualização de valores única
 */
export interface SimpleUpdateProps extends InputOptions {
  /** ID da planilha */
  spreadsheetId: SpreadsheetId;
  /** Range a ser atualizado */
  range: SimpleRange;
  /** Dados a serem inseridos */
  values: TableData;
}

/**
 * Props simplificadas para atualização em lote
 */
export interface SimpleBatchUpdateProps extends InputOptions {
  /** ID da planilha */
  spreadsheetId: SpreadsheetId;
  /** Array de ranges e seus dados */
  data: SimpleValueRange[];
}

// ============================================================================
// RESPOSTAS SIMPLIFICADAS
// ============================================================================

/**
 * Resposta simplificada de atualização
 */
export interface SimpleUpdateResponse {
  /** ID da planilha */
  spreadsheetId: SpreadsheetId;
  /** Range atualizado */
  updatedRange: SimpleRange;
  /** Número de linhas atualizadas */
  updatedRows: number;
  /** Número de colunas atualizadas */
  updatedColumns: number;
  /** Número de células atualizadas */
  updatedCells: number;
  /** Dados atualizados (se solicitado) */
  updatedData?: SimpleValueRange;
}

/**
 * Resposta simplificada de atualização em lote
 */
export interface SimpleBatchUpdateResponse {
  /** ID da planilha */
  spreadsheetId: SpreadsheetId;
  /** Total de ranges atualizados */
  totalUpdatedRanges: number;
  /** Total de linhas atualizadas */
  totalUpdatedRows: number;
  /** Total de colunas atualizadas */
  totalUpdatedColumns: number;
  /** Total de células atualizadas */
  totalUpdatedCells: number;
  /** Respostas individuais para cada range */
  responses: SimpleUpdateResponse[];
}

/**
 * Erro simplificado
 */
export interface SimpleError {
  /** Código do erro */
  code?: string;
  /** Mensagem de erro */
  message: string;
  /** Detalhes adicionais */
  details?: Record<string, unknown>;
}

// ============================================================================
// UTILITÁRIOS DE TIPOS
// ============================================================================

/**
 * Resultado que pode ser sucesso ou erro
 */
export type Result<T> = T | SimpleError;

/**
 * Função para verificar se é erro
 */
export function isError(result: Result<unknown>): result is SimpleError {
  return result !== null && typeof result === 'object' && 'message' in result;
}

/**
 * Função para verificar se é sucesso
 */
export function isSuccess<T>(result: Result<T>): result is T {
  return !isError(result);
}

// ============================================================================
// TIPOS DE CONFIGURAÇÃO
// ============================================================================

/**
 * Configurações da conexão
 */
export interface ConnectionConfig {
  /** Chave de API ou token de acesso */
  apiKey?: string;
  /** Token de acesso OAuth */
  accessToken?: string;
  /** ID do cliente OAuth */
  clientId?: string;
  /** Secret do cliente OAuth */
  clientSecret?: string;
}

/**
 * Metadados da planilha
 */
export interface SpreadsheetMetadata {
  /** ID da planilha */
  spreadsheetId: SpreadsheetId;
  /** Título da planilha */
  title: string;
  /** URL da planilha */
  url: string;
  /** Lista de abas/sheets */
  sheets: SheetMetadata[];
}

/**
 * Metadados de uma aba/sheet
 */
export interface SheetMetadata {
  /** ID da aba */
  sheetId: number;
  /** Nome da aba */
  title: string;
  /** Índice da aba */
  index: number;
  /** Propriedades da grade */
  gridProperties: {
    rowCount: number;
    columnCount: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
  };
} 