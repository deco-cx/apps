/**
 * @format image-uri
 */
export type ImageWidget = string;

/**
 * @format html
 */
export type HTMLWidget = string;

/**
 * @format video-uri
 */
export type VideoWidget = string;

/**
 * @format file-uri
 */
export type FileWidget = string;

/**
 * @format dynamic-options
 * @options website/loaders/options/routes.ts
 */
export type SiteRoute = string;

/**
 * @format map
 */
export type MapWidget = string;

/**
 * @format date
 */
export type DateWidget = string;

/**
 * @format date-time
 */
export type DateTimeWidget = string;

/**
 * @format textarea
 */
export type TextArea = string;

/**
 * @format rich-text
 */
export type RichText = string;

/**
 * @format color-input
 * @default #000000
 */
export type Color = string;

/**
 * @format code
 * @language css
 */
export type CSS = string;

/**
 * @format code
 * @language typescript
 */
export type TypeScript = string;

/**
 * @format code
 * @language json
 */
export type Json = string;

/**
 * @format file-uri
 * @accept text/csv
 */
export type CSVWidget = string;

/**
 * @format file-uri
 * @accept application/pdf
 */
export type PDFWidget = string;
