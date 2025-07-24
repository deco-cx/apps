/**
 * Google Sheets API data types
 */

export interface Spreadsheet {
  spreadsheetId: string;
  properties?: SpreadsheetProperties;
  sheets?: Sheet[];
  namedRanges?: NamedRange[];
  spreadsheetUrl?: string;
}

export interface SpreadsheetProperties {
  title?: string;
  locale?: string;
  autoRecalc?: string;
  timeZone?: string;
  defaultFormat?: CellFormat;
  iterativeCalculationSettings?: IterativeCalculationSettings;
  spreadsheetTheme?: SpreadsheetTheme;
  importFunctionsExternalUrlAccessAllowed?: boolean;
}

export interface IterativeCalculationSettings {
  maxIterations?: number;
  convergenceThreshold?: number;
}

export interface SpreadsheetTheme {
  primaryFontFamily?: string;
  themeColors?: ThemeColorPair[];
}

export interface ThemeColorPair {
  colorType?: string;
  color?: Color;
}

export interface Sheet {
  properties?: SheetProperties;
  data?: GridData[];
  merges?: GridRange[];
  conditionalFormats?: ConditionalFormatRule[];
  filterViews?: FilterView[];
  protectedRanges?: ProtectedRange[];
  basicFilter?: BasicFilter;
}

export interface SheetProperties {
  sheetId?: number;
  title?: string;
  index?: number;
  sheetType?: string;
  gridProperties?: GridProperties;
  hidden?: boolean;
  rightToLeft?: boolean;
}

export interface GridProperties {
  rowCount?: number;
  columnCount?: number;
  frozenRowCount?: number;
  frozenColumnCount?: number;
}

export interface GridData {
  startRow?: number;
  startColumn?: number;
  rowData?: RowData[];
}

export interface RowData {
  values?: CellData[];
}

export interface CellData {
  userEnteredValue?: ExtendedValue;
  effectiveValue?: ExtendedValue;
  formattedValue?: string;
  userEnteredFormat?: CellFormat;
  effectiveFormat?: CellFormat;
}

export interface ExtendedValue {
  numberValue?: number;
  stringValue?: string;
  boolValue?: boolean;
  formulaValue?: string;
  errorValue?: ErrorValue;
}

export interface ErrorValue {
  type?: string;
  message?: string;
}

export interface CellFormat {
  numberFormat?: NumberFormat;
  backgroundColor?: Color;
  textFormat?: TextFormat;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  wrapStrategy?: string;
}

export interface NumberFormat {
  type?: string;
  pattern?: string;
}

export interface Color {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

export interface TextFormat {
  foregroundColor?: Color;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
}

export interface NamedRange {
  namedRangeId?: string;
  name?: string;
  range?: GridRange;
}

export interface GridRange {
  sheetId?: number;
  startRowIndex?: number;
  endRowIndex?: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}

export interface ConditionalFormatRule {
  ranges?: GridRange[];
  booleanRule?: BooleanRule;
  gradientRule?: GradientRule;
}

export interface BooleanRule {
  condition?: BooleanCondition;
  format?: CellFormat;
}

export interface BooleanCondition {
  type?: string;
  values?: ConditionValue[];
}

export interface ConditionValue {
  userEnteredValue?: string;
  relativeDate?: string;
}

export interface GradientRule {
  minpoint?: GradientRulePoint;
  midpoint?: GradientRulePoint;
  maxpoint?: GradientRulePoint;
}

export interface GradientRulePoint {
  color?: Color;
  type?: string;
  value?: string;
}

export interface FilterView {
  filterViewId?: number;
  title?: string;
  range?: GridRange;
  namedRangeId?: string;
  sortSpecs?: SortSpec[];
  criteria?: { [key: number]: FilterCriteria };
}

export interface SortSpec {
  dimensionIndex?: number;
  sortOrder?: string;
}

export interface FilterCriteria {
  hiddenValues?: string[];
  condition?: BooleanCondition;
}

export interface ProtectedRange {
  protectedRangeId?: number;
  range?: GridRange;
  namedRangeId?: string;
  description?: string;
  warningOnly?: boolean;
  requestingUserCanEdit?: boolean;
  editors?: Editors;
}

export interface Editors {
  users?: string[];
  groups?: string[];
  domainUsersCanEdit?: boolean;
}

export interface BasicFilter {
  range?: GridRange;
  sortSpecs?: SortSpec[];
  criteria?: { [key: number]: FilterCriteria };
}

export interface ValueRange {
  range?: string;
  majorDimension?: string;
  values?: CellValue[][];
  meta?: {
    totalResults: number;
    hasResults: boolean;
    query: string;
    searchedSheet?: string;
    searchedSheets?: string[];
    message: string;
    resultDetails: Array<{
      sheet: string;
      resultIndex: number;
      originalRowEstimate: number;
      columnCount: number;
      columnRange: string;
    }>;
  };
}

export interface BatchUpdateValuesRequest {
  valueInputOption?: string;
  data?: ValueRange[];
  includeValuesInResponse?: boolean;
  responseValueRenderOption?: string;
  responseDateTimeRenderOption?: string;
}

export interface BatchUpdateValuesResponse {
  spreadsheetId?: string;
  totalUpdatedRows?: number;
  totalUpdatedColumns?: number;
  totalUpdatedCells?: number;
  totalUpdatedSheets?: number;
  responses?: UpdateValuesResponse[];
}

export interface UpdateValuesResponse {
  spreadsheetId?: string;
  updatedRange?: string;
  updatedRows?: number;
  updatedColumns?: number;
  updatedCells?: number;
  updatedData?: ValueRange;
}

export interface DeveloperMetadata {
  metadataId?: number;
  metadataKey?: string;
  metadataValue?: string;
  location?: DeveloperMetadataLocation;
  visibility?: string;
}

export interface DeveloperMetadataLocation {
  locationType?: string;
  sheetId?: number;
  dimensionRange?: DimensionRange;
}

export interface DimensionRange {
  sheetId?: number;
  dimension?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface BatchUpdateSpreadsheetRequest {
  requests?: Request[];
  includeSpreadsheetInResponse?: boolean;
  responseRanges?: string[];
  responseIncludeGridData?: boolean;
}

export interface Request {
  updateSheetProperties?: UpdateSheetPropertiesRequest;
  updateCells?: UpdateCellsRequest;
  addSheet?: AddSheetRequest;
  deleteSheet?: DeleteSheetRequest;
  updateTable?: UpdateTableRequest;
}

export interface UpdateSheetPropertiesRequest {
  properties?: SheetProperties;
  fields?: string;
}

export interface UpdateCellsRequest {
  start?: GridCoordinate;
  rows?: RowData[];
  fields?: string;
  range?: GridRange;
}

export interface GridCoordinate {
  sheetId?: number;
  rowIndex?: number;
  columnIndex?: number;
}

export interface AddSheetRequest {
  properties?: SheetProperties;
}

export interface DeleteSheetRequest {
  sheetId?: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface SearchParamsGoogle {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type: string;
}

export interface Table {
  tableId?: string;
  tableRange?: string;
  name?: string;
  columns?: TableColumn[];
  rows?: TableRow[];
  bandings?: TableBanding[];
  dataExecutionStatus?: DataExecutionStatus;
}

export interface TableColumn {
  columnId?: string;
  name?: string;
  width?: number;
}

export interface TableRow {
  rowId?: string;
  values?: TableCellValue[];
}

export interface TableCellValue {
  userEnteredValue?: ExtendedValue;
  formattedValue?: string;
}

export interface TableBanding {
  bandedRangeId?: string;
  headerColor?: Color;
  firstBandColor?: Color;
  secondBandColor?: Color;
}

export interface DataExecutionStatus {
  state?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface UpdateTableResponse {
  spreadsheetId?: string;
  tableId?: string;
  table?: Table;
}

export interface UpdateTableRequest {
  tableId?: string;
  table?: Table;
  fields?: string;
}

/**
 * Simplified cell value - accepts the most common types
 */
export type CellValue = string | number | boolean | null | undefined;

/**
 * Data row - array of cell values
 */
export type Row = CellValue[];

/**
 * Tabular data - array of rows
 */
export type TableData = Row[];

/**
 * Simple range - string in A1 notation
 * Examples: "A1", "Sheet1!A1", "A1:B10", "Data!C2:E5"
 */
export type SimpleRange = string;

/**
 * Spreadsheet ID - alphanumeric string
 */
export type SpreadsheetId = string;

/**
 * Simplified value range
 */
export interface SimpleValueRange {
  /** Range in A1 notation */
  range: SimpleRange;
  /** Table data */
  values: TableData;
  /** How to interpret the data (default: ROWS) */
  majorDimension?: "ROWS" | "COLUMNS";
}

/**
 * Data input options
 */
export interface InputOptions {
  /** How to interpret input values */
  valueInputOption?: "RAW" | "USER_ENTERED";
  /** Include updated values in response */
  includeValuesInResponse?: boolean;
  /** Response values format */
  responseValueRenderOption?:
    | "FORMATTED_VALUE"
    | "UNFORMATTED_VALUE"
    | "FORMULA";
  /** Response date/time format */
  responseDateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * Simplified props for single value update
 */
export interface SimpleUpdateProps extends InputOptions {
  /** Spreadsheet ID */
  spreadsheetId: SpreadsheetId;
  /** Range to be updated */
  range: SimpleRange;
  /** Data to be inserted */
  values: TableData;
}

/**
 * Simplified props for batch update
 */
export interface SimpleBatchUpdateProps extends InputOptions {
  /** Spreadsheet ID */
  spreadsheetId: SpreadsheetId;
  /** Array of ranges and their data */
  data: SimpleValueRange[];
}

/**
 * Simplified update response
 */
export interface SimpleUpdateResponse {
  /** Spreadsheet ID */
  spreadsheetId: SpreadsheetId;
  /** Updated range */
  updatedRange: SimpleRange;
  /** Number of updated rows */
  updatedRows: number;
  /** Number of updated columns */
  updatedColumns: number;
  /** Number of updated cells */
  updatedCells: number;
  /** Updated data (if requested) */
  updatedData?: SimpleValueRange;
}

/**
 * Simplified batch update response
 */
export interface SimpleBatchUpdateResponse {
  /** Spreadsheet ID */
  spreadsheetId: SpreadsheetId;
  /** Total updated ranges */
  totalUpdatedRanges: number;
  /** Total updated rows */
  totalUpdatedRows: number;
  /** Total updated columns */
  totalUpdatedColumns: number;
  /** Total updated cells */
  totalUpdatedCells: number;
  /** Individual responses for each range */
  responses: SimpleUpdateResponse[];
}

/**
 * Simplified error
 */
export interface SimpleError {
  /** Error code */
  code?: string;
  /** Error message */
  message: string;
  /** Additional details */
  details?: Record<string, unknown>;
}

/**
 * Result that can be success or error
 */
export type Result<T> = T | SimpleError;

/**
 * Function to check if it's an error
 */
export function isError(result: Result<unknown>): result is SimpleError {
  return (result as SimpleError).message !== undefined;
}

/**
 * Function to check if it's success
 */
export function isSuccess<T>(result: Result<T>): result is T {
  return !isError(result);
}

/**
 * Spreadsheet metadata
 */
export interface SpreadsheetMetadata {
  /** Spreadsheet ID */
  spreadsheetId: SpreadsheetId;
  /** Spreadsheet title */
  title: string;
  /** Spreadsheet URL */
  url: string;
  /** List of sheets/tabs */
  sheets: SheetMetadata[];
}

/**
 * Sheet/tab metadata
 */
export interface SheetMetadata {
  /** Sheet ID */
  sheetId: number;
  /** Sheet name */
  title: string;
  /** Sheet index */
  index: number;
  /** Grid properties */
  gridProperties: {
    rowCount: number;
    columnCount: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
  };
}

export interface OptimizedSpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  url: string;
  locale?: string;
  sheets: Array<{
    id: number;
    title: string;
    rowCount: number;
    columnCount: number;
    dataRange?: string;
    filledCells?: number;
  }>;
}

export interface ActionBatchUpdateProps {
  first_cell_location?: string;
  includeValuesInResponse?: boolean;
  sheet_name: string;
  spreadsheet_id: string;
  valueInputOption?: "RAW" | "USER_ENTERED";
  values: string[][];
}
