import { GOOGLE_USER_INFO_SCOPES } from "../../mcp/utils/google/userInfo.ts";

export const SCOPES = [
  ...GOOGLE_USER_INFO_SCOPES,
  "https://www.googleapis.com/auth/spreadsheets",
];

export const GOOGLE_SHEETS_URL = "https://sheets.googleapis.com";
export const GOOGLE_OAUTH_URL = "https://oauth2.googleapis.com";
export const GOOGLE_OAUTH_URL_AUTH =
  "https://accounts.google.com/o/oauth2/v2/auth";

export const GOOGLE_SHEETS_ERROR_MESSAGES = {
  "PERMISSION_DENIED":
    "Access denied to the spreadsheet. Please verify your permissions.",
  "NOT_FOUND": "Spreadsheet not found. Please check the spreadsheet ID.",
  "INVALID_ARGUMENT":
    "Invalid argument in your Google Sheets request. Please check your parameters.",
  "FAILED_PRECONDITION":
    "Operation not allowed in the current state of the spreadsheet.",
  "RESOURCE_EXHAUSTED":
    "Google Sheets API request limit exceeded. Please try again later.",
  "UNAUTHENTICATED":
    "Authentication failed for Google Sheets API. Please check your credentials.",
  "QUOTA_EXCEEDED": "Google Sheets API quota exceeded. Please try again later.",
  "ALREADY_EXISTS": "The resource already exists in Google Sheets.",
  "DEADLINE_EXCEEDED":
    "The Google Sheets operation timed out. Please try again.",
  "UNAVAILABLE":
    "Google Sheets service temporarily unavailable. Please try again later.",
  "RANGE_NOT_FOUND": "The specified range was not found in the spreadsheet.",
  "DIMENSION_MISMATCH":
    "The input data dimensions do not match the target range dimensions.",
  "SHEET_NOT_FOUND": "The specified sheet was not found in the spreadsheet.",
  "INVALID_VALUE":
    "One or more values in your request are invalid for Google Sheets.",
} as const;

export const TEMP_QUERY_SHEET_NAME = "temp_query_sheet";
export const FORMULA_ADD_ROW_NUMBER =
  '=ARRAYFORMULA(IF(LEN(A2:A); ROW(A2:A) - ROW(A2) + 1; ""))';
