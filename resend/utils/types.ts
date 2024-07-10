export const RESEND_ERROR_CODES_BY_KEY = {
  missing_required_field: 422,
  invalid_access: 422,
  invalid_parameter: 422,
  invalid_region: 422,
  rate_limit_exceeded: 429,
  missing_api_key: 401,
  invalid_api_Key: 403,
  invalid_from_address: 403,
  validation_error: 403,
  not_found: 404,
  method_not_allowed: 405,
  application_error: 500,
  internal_server_error: 500,
} as const;

export type RESEND_ERROR_CODE_KEY = keyof typeof RESEND_ERROR_CODES_BY_KEY;

export interface ErrorResponse {
  message: string;
  name: RESEND_ERROR_CODE_KEY;
}

export interface CreateEmailResponseSuccess {
  /** The ID of the newly created email. */
  id: string;
}

export interface CreateEmailResponse {
  data: CreateEmailResponseSuccess | null;
  error: ErrorResponse | null;
}

export interface CreateEmailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  bcc?: string | string[];
  cc?: string | string[];
  reply_to?: string | string[];
  html?: string;
  text?: string;
  // react?: JSX.Element | null; <-- Convert your react email template when the action is triggered to HTML using render
  headers?: Headers;
}
