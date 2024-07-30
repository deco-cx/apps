export const EMAILJS_ERROR_CODES_BY_KEY = {
  ok: 200,
  invalid_parameter: 400,
} as const;

export type EMAILJS_ERROR_CODE_KEY = keyof typeof EMAILJS_ERROR_CODES_BY_KEY;

export interface ErrorResponse {
  message: string;
  name: EMAILJS_ERROR_CODE_KEY;
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
  service_id: string;
  template_id: string;
  user_id?: string;
  template_params?: { [key: string]: string };
  accessToken?: string;
  headers?: Headers;
}
