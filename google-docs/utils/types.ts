export interface Document {
  documentId: string;
  title: string;
  body?: DocumentBody;
  headers?: Record<string, Header>;
  footers?: Record<string, Footer>;
  footnotes?: Record<string, Footnote>;
  suggestionsViewMode?: string;
  revisionId?: string;
}

export interface DocumentBody {
  content: StructuralElement[];
}

export interface StructuralElement {
  startIndex?: number;
  endIndex?: number;
  paragraph?: Paragraph;
  table?: Table;
  tableOfContents?: TableOfContents;
  sectionBreak?: SectionBreak;
}

export interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: ParagraphStyle;
  bullet?: Bullet;
}

export interface ParagraphElement {
  startIndex?: number;
  endIndex?: number;
  textRun?: TextRun;
  autoText?: AutoText;
  pageBreak?: PageBreak;
  columnBreak?: ColumnBreak;
  footnoteReference?: FootnoteReference;
  horizontalRule?: HorizontalRule;
  equation?: Equation;
  inlineObjectElement?: InlineObjectElement;
  person?: Person;
  richLink?: RichLink;
}

export interface TextRun {
  content: string;
  textStyle?: TextStyle;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  smallCaps?: boolean;
  backgroundColor?: OptionalColor;
  foregroundColor?: OptionalColor;
  fontSize?: Dimension;
  weightedFontFamily?: WeightedFontFamily;
  baselineOffset?: string;
  link?: Link;
}

export interface ParagraphStyle {
  headingId?: string;
  namedStyleType?: string;
  alignment?: string;
  lineSpacing?: number;
  direction?: string;
  spacingMode?: string;
  spaceAbove?: Dimension;
  spaceBelow?: Dimension;
  borderBetween?: ParagraphBorder;
  borderTop?: ParagraphBorder;
  borderBottom?: ParagraphBorder;
  borderLeft?: ParagraphBorder;
  borderRight?: ParagraphBorder;
  indentFirstLine?: Dimension;
  indentStart?: Dimension;
  indentEnd?: Dimension;
  tabStops?: TabStop[];
  keepLinesTogether?: boolean;
  keepWithNext?: boolean;
  avoidWidowAndOrphan?: boolean;
  shading?: Shading;
}

export interface Table {
  rows: number;
  columns: number;
  tableRows: TableRow[];
  tableStyle?: TableStyle;
}

export interface TableRow {
  startIndex?: number;
  endIndex?: number;
  tableCells: TableCell[];
  tableRowStyle?: TableRowStyle;
}

export interface TableCell {
  startIndex?: number;
  endIndex?: number;
  content: StructuralElement[];
  tableCellStyle?: TableCellStyle;
}

export interface OptionalColor {
  color?: Color;
}

export interface Color {
  rgbColor?: RgbColor;
}

export interface RgbColor {
  red?: number;
  green?: number;
  blue?: number;
}

export interface Dimension {
  magnitude?: number;
  unit?: string;
}

export interface WeightedFontFamily {
  fontFamily?: string;
  weight?: number;
}

export interface Link {
  url?: string;
  bookmarkId?: string;
  headingId?: string;
}

export interface ParagraphBorder {
  color?: OptionalColor;
  width?: Dimension;
  padding?: Dimension;
  dashStyle?: string;
}

export interface TabStop {
  offset?: Dimension;
  alignment?: string;
}

export interface Shading {
  backgroundColor?: OptionalColor;
}

export interface TableStyle {
  tableColumnProperties?: TableColumnProperties[];
}

export interface TableRowStyle {
  minRowHeight?: Dimension;
}

export interface TableCellStyle {
  rowSpan?: number;
  columnSpan?: number;
  backgroundColor?: OptionalColor;
  borderTop?: TableCellBorder;
  borderBottom?: TableCellBorder;
  borderLeft?: TableCellBorder;
  borderRight?: TableCellBorder;
  paddingTop?: Dimension;
  paddingBottom?: Dimension;
  paddingLeft?: Dimension;
  paddingRight?: Dimension;
  contentAlignment?: string;
}

export interface TableCellBorder {
  color?: OptionalColor;
  width?: Dimension;
  dashStyle?: string;
}

export interface TableColumnProperties {
  widthType?: string;
  width?: Dimension;
}

export interface TableOfContents {
  content: StructuralElement[];
}

export interface SectionBreak {
  sectionStyle?: SectionStyle;
}

export interface SectionStyle {
  columnSeparatorStyle?: string;
  contentDirection?: string;
  sectionType?: string;
  defaultHeaderId?: string;
  defaultFooterId?: string;
  evenPageHeaderId?: string;
  evenPageFooterId?: string;
  firstPageHeaderId?: string;
  firstPageFooterId?: string;
  useFirstPageHeaderFooter?: boolean;
  marginTop?: Dimension;
  marginBottom?: Dimension;
  marginLeft?: Dimension;
  marginRight?: Dimension;
  pageNumberStart?: number;
  columnProperties?: SectionColumnProperties[];
}

export interface SectionColumnProperties {
  width?: Dimension;
  paddingEnd?: Dimension;
}

export interface Header {
  headerId: string;
  content: StructuralElement[];
}

export interface Footer {
  footerId: string;
  content: StructuralElement[];
}

export interface Footnote {
  footnoteId: string;
  content: StructuralElement[];
}

export interface AutoText {
  type?: string;
  textStyle?: TextStyle;
}

export interface PageBreak {
  textStyle?: TextStyle;
}

export interface ColumnBreak {
  textStyle?: TextStyle;
}

export interface FootnoteReference {
  footnoteId?: string;
  footnoteNumber?: string;
  textStyle?: TextStyle;
}

export interface HorizontalRule {
  textStyle?: TextStyle;
}

export interface Equation {
  textStyle?: TextStyle;
}

export interface InlineObjectElement {
  inlineObjectId?: string;
  textStyle?: TextStyle;
}

export interface Person {
  personId?: string;
  personProperties?: PersonProperties;
  textStyle?: TextStyle;
}

export interface PersonProperties {
  name?: string;
  email?: string;
}

export interface RichLink {
  richLinkId?: string;
  richLinkProperties?: RichLinkProperties;
  textStyle?: TextStyle;
}

export interface RichLinkProperties {
  title?: string;
  uri?: string;
  mimeType?: string;
}

export interface Bullet {
  listId?: string;
  nestingLevel?: number;
  textStyle?: TextStyle;
}

export interface DocumentsListResponse {
  documents: DocumentMetadata[];
  nextPageToken?: string;
}

export interface DocumentMetadata {
  documentId: string;
  title: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  owners: User[];
  lastModifyingUser: User;
  shared: boolean;
  permissions: Permission[];
  size: string;
}

export interface User {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
  me?: boolean;
}

export interface Permission {
  id: string;
  type: string;
  emailAddress?: string;
  domain?: string;
  role: string;
  displayName?: string;
  photoLink?: string;
  deleted?: boolean;
  pendingOwner?: boolean;
}

export interface CreateDocumentRequest {
  title?: string;
}

export interface CreateDocumentResponse {
  documentId: string;
  title: string;
  revisionId: string;
}

export interface BatchUpdateDocumentRequest {
  requests: Request[];
  writeControl?: WriteControl;
}

export interface Request {
  insertText?: InsertTextRequest;
  deleteContentRange?: DeleteContentRangeRequest;
  replaceAllText?: ReplaceAllTextRequest;
  updateTextStyle?: UpdateTextStyleRequest;
  updateParagraphStyle?: UpdateParagraphStyleRequest;
  insertPageBreak?: InsertPageBreakRequest;
  insertTable?: InsertTableRequest;
  insertTableRow?: InsertTableRowRequest;
  insertTableColumn?: InsertTableColumnRequest;
  deleteTableRow?: DeleteTableRowRequest;
  deleteTableColumn?: DeleteTableColumnRequest;
}

export interface InsertTextRequest {
  location: Location;
  text: string;
}

export interface DeleteContentRangeRequest {
  range: Range;
}

export interface ReplaceAllTextRequest {
  containsText: SubstringMatchCriteria;
  replaceText: string;
}

export interface UpdateTextStyleRequest {
  range: Range;
  textStyle: TextStyle;
  fields: string;
}

export interface UpdateParagraphStyleRequest {
  range: Range;
  paragraphStyle: ParagraphStyle;
  fields: string;
}

export interface InsertPageBreakRequest {
  location: Location;
}

export interface InsertTableRequest {
  location: Location;
  rows: number;
  columns: number;
}

export interface InsertTableRowRequest {
  tableCellLocation: TableCellLocation;
  insertBelow?: boolean;
}

export interface InsertTableColumnRequest {
  tableCellLocation: TableCellLocation;
  insertRight?: boolean;
}

export interface DeleteTableRowRequest {
  tableCellLocation: TableCellLocation;
}

export interface DeleteTableColumnRequest {
  tableCellLocation: TableCellLocation;
}

export interface Location {
  index: number;
  segmentId?: string;
}

export interface Range {
  startIndex: number;
  endIndex: number;
  segmentId?: string;
}

export interface SubstringMatchCriteria {
  text: string;
  matchCase?: boolean;
}

export interface TableCellLocation {
  tableStartLocation: Location;
  rowIndex: number;
  columnIndex: number;
}

export interface WriteControl {
  requiredRevisionId?: string;
  targetRevisionId?: string;
}

export interface BatchUpdateDocumentResponse {
  documentId: string;
  replies: Reply[];
  writeControl?: WriteControl;
}

export interface Reply {
  insertText?: InsertTextReply;
  replaceAllText?: ReplaceAllTextReply;
}

export type InsertTextReply = Record<PropertyKey, never>;

export interface ReplaceAllTextReply {
  occurrencesChanged: number;
}
