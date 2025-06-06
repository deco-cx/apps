type LabelMap = Record<string, string>;

export class SheetsQueryBuilder {
  private _sheet = "";
  private _range = "";
  private _select: string[] = [];
  private _where: string[] = [];
  private _label: LabelMap = {};
  private _orderBy: string[] = [];
  private _header = 1;
  private _headerMap: Map<string, number> = new Map();
  private _includeRowNumber = false;

  constructor() {}

  range(sheet: string, range: string): this {
    this._sheet = sheet;
    this._range = range;
    return this;
  }

  includeRowNumber(): this {
    this._includeRowNumber = true;
    return this;
  }

  select(columns: string[]): this {
    this._select = columns.map((col) =>
      SheetsQueryBuilder.columnLetterOrNameToCol(col, this._headerMap)
    );
    return this;
  }

  where(conditions: string[]): this {
    this._where.push(...conditions);
    return this;
  }

  searchAcrossColumns(term: string, columns: string[]): this {
    const conditions = columns.map(
      (col) =>
        `${
          SheetsQueryBuilder.columnLetterOrNameToCol(col, this._headerMap)
        } CONTAINS '${term}'`,
    );
    this._where.push(...conditions);
    return this;
  }

  orderBy(columns: string[]): this {
    this._orderBy = columns.map((col) =>
      SheetsQueryBuilder.columnLetterOrNameToCol(col, this._headerMap)
    );
    return this;
  }

  label(map: LabelMap): this {
    Object.assign(this._label, map);
    return this;
  }

  header(num: number): this {
    this._header = num;
    return this;
  }

  headerMap(map: Map<string, number>): this {
    this._headerMap = map;
    return this;
  }

  build(): string {
    const range = `'${this._sheet}'!${this._range}`;
    const columnCount = this.getColumnCountFromRange();

    const rowNumberColumn = `Col${columnCount}`; // Última coluna será sempre o número da linha

    const selectPart = this._select.length
      ? `SELECT ${
        [this._includeRowNumber ? rowNumberColumn : null, ...this._select]
          .filter(Boolean).join(", ")
      }`
      : "";

    const wherePart = this._where.length
      ? `WHERE ${this._where.join(" OR ")}`
      : "";
    const orderByPart = this._orderBy.length
      ? `ORDER BY ${this._orderBy.join(", ")}`
      : "";

    const labelPart = Object.keys(this._label).length
      ? "LABEL " +
        Object.entries(this._label).map(([k, v]) => `${k} '${v}'`).join(", ")
      : "";

    const query = [selectPart, wherePart, orderByPart, labelPart]
      .filter(Boolean)
      .join(" ");

    return `=QUERY(${range}; "${query}"; ${this._header})`;
  }

  private getColumnCountFromRange(): number {
    const [, end] = this._range.split(":");
    const columnLetters = end.match(/[A-Z]+/)?.[0] || "A";
    return SheetsQueryBuilder.letterToNumber(columnLetters) + 1;
  }

  static columnLetterOrNameToCol(
    input: string,
    headerMap?: Map<string, number>,
  ): string {
    if (/^[A-Z]+$/.test(input)) {
      const colNum = SheetsQueryBuilder.letterToNumber(input);
      return `Col${colNum}`;
    }

    if (headerMap?.has(input)) {
      const colIndex = headerMap.get(input);
      if (colIndex !== undefined) {
        return `Col${colIndex + 1}`;
      }
    }

    throw new Error(`Coluna não encontrada: "${input}"`);
  }

  static letterToNumber(letters: string): number {
    return letters.toUpperCase().split("").reduce(
      (r, c) => r * 26 + c.charCodeAt(0) - 64,
      0,
    );
  }
}
