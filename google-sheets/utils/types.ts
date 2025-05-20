// client.ts para API Google Sheets

// Tipos de dados para as entidades principais da API Google Sheets
export interface Spreadsheet {
  spreadsheetId: string;
  properties?: SheetProperties;
  sheets?: Sheet[];
  namedRanges?: NamedRange[];
  spreadsheetUrl?: string;
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
  // deno-lint-ignore no-explicit-any
  values?: any[][];
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
  // Outros tipos de requests podem ser adicionados conforme necessário
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
