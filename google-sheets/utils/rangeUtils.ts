export function columnLetterToNumber(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result;
}

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
 * Build the full range in A1 notation
 * @param sheetName Sheet name/tab
 * @param firstCell Initial cell (ex: "A1", "B2")
 * @param values 2D data to calculate the range automatically
 * @returns Range in the format "Sheet1!A1:B3" or "A1:B3"
 */
export function buildFullRange(
  sheetName: string,
  firstCell: string,
  values: string[][],
): string {
  if (!values || values.length === 0) {
    return sheetName ? `${sheetName}!${firstCell}` : firstCell;
  }

  const match = firstCell.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(
      `Invalid cell format: ${firstCell}. Use format like A1, B2, etc.`,
    );
  }

  const [, startColumn, startRowStr] = match;
  const startRow = parseInt(startRowStr, 10);

  const numRows = values.length;
  const numCols = Math.max(...values.map((row) => row.length));

  if (numRows === 1 && numCols === 1) {
    return sheetName ? `${sheetName}!${firstCell}` : firstCell;
  }

  const endColumn = columnNumberToLetter(
    columnLetterToNumber(startColumn) + numCols - 1,
  );
  const endRow = startRow + numRows - 1;

  const range = `${firstCell}:${endColumn}${endRow}`;
  return sheetName ? `${sheetName}!${range}` : range;
}

/**
 * Validate if a cell is in a valid A1 notation
 * @param cellReference Cell reference (ex: "A1", "Z999")
 * @returns true if valid, false otherwise
 */
export function isValidCellReference(cellReference: string): boolean {
  return /^[A-Z]+\d+$/.test(cellReference);
}
