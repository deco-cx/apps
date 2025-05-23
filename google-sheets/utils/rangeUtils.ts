/**
 * Utilitários para manipulação de ranges do Google Sheets
 */

/**
 * Converte letra da coluna para número (A=1, B=2, ..., Z=26, AA=27, etc.)
 */
export function columnLetterToNumber(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result;
}

/**
 * Converte número para letra da coluna (1=A, 2=B, ..., 26=Z, 27=AA, etc.)
 */
export function columnNumberToLetter(num: number): string {
  let result = "";
  while (num > 0) {
    num--;
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

/**
 * Constrói o range completo no formato A1 notation
 * @param sheetName Nome da planilha/aba
 * @param firstCell Célula inicial (ex: "A1", "B2")
 * @param values Dados 2D para calcular o range automaticamente
 * @returns Range no formato "Sheet1!A1:B3" ou "A1:B3"
 */
export function buildFullRange(sheetName: string, firstCell: string, values: string[][]): string {
  if (!values || values.length === 0) {
    return sheetName ? `${sheetName}!${firstCell}` : firstCell;
  }

  const match = firstCell.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell format: ${firstCell}. Use format like A1, B2, etc.`);
  }

  const [, startColumn, startRowStr] = match;
  const startRow = parseInt(startRowStr, 10);

  const numRows = values.length;
  const numCols = Math.max(...values.map(row => row.length));

  if (numRows === 1 && numCols === 1) {
    return sheetName ? `${sheetName}!${firstCell}` : firstCell;
  }

  const endColumn = columnNumberToLetter(columnLetterToNumber(startColumn) + numCols - 1);
  const endRow = startRow + numRows - 1;

  const range = `${firstCell}:${endColumn}${endRow}`;
  return sheetName ? `${sheetName}!${range}` : range;
}

/**
 * Valida se uma célula está no formato A1 notation válido
 * @param cellReference Referência da célula (ex: "A1", "Z999")
 * @returns true se válido, false caso contrário
 */
export function isValidCellReference(cellReference: string): boolean {
  return /^[A-Z]+\d+$/.test(cellReference);
}

/**
 * Extrai componentes de uma referência de célula
 * @param cellReference Referência da célula (ex: "A1", "BC123")
 * @returns Objeto com coluna (letra) e linha (número)
 */
export function parseCellReference(cellReference: string): { column: string; row: number } {
  const match = cellReference.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell format: ${cellReference}`);
  }
  return {
    column: match[1],
    row: parseInt(match[2], 10),
  };
}

/**
 * Constrói uma referência de célula a partir dos componentes
 * @param column Letra da coluna (ex: "A", "BC")
 * @param row Número da linha (ex: 1, 123)
 * @returns Referência da célula (ex: "A1", "BC123")
 */
export function buildCellReference(column: string, row: number): string {
  return `${column}${row}`;
}

/**
 * Calcula a próxima coluna
 * @param column Coluna atual (ex: "A", "Z", "AA")
 * @returns Próxima coluna (ex: "B", "AA", "AB")
 */
export function getNextColumn(column: string): string {
  const num = columnLetterToNumber(column);
  return columnNumberToLetter(num + 1);
}

/**
 * Calcula o range automático baseado no número de linhas e colunas
 * @param startCell Célula inicial
 * @param numRows Número de linhas
 * @param numCols Número de colunas
 * @returns Range calculado
 */
export function calculateRange(startCell: string, numRows: number, numCols: number): string {
  if (numRows <= 0 || numCols <= 0) {
    return startCell;
  }

  const { column: startColumn, row: startRow } = parseCellReference(startCell);
  
  if (numRows === 1 && numCols === 1) {
    return startCell;
  }

  const endColumn = columnNumberToLetter(columnLetterToNumber(startColumn) + numCols - 1);
  const endRow = startRow + numRows - 1;

  return `${startCell}:${endColumn}${endRow}`;
} 