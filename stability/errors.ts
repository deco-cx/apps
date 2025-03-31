interface GatewayError {
  toResponse: () => Response;
}

interface ErrorOpts {
  details?: Record<string, unknown>;
}

class GatewayError implements GatewayError {
  private error: Error;
  public code: string;
  public status: number;
  public details: Record<string, unknown>;

  constructor(_error: Error | string) {
    this.error = typeof _error === "string" ? new Error(_error) : _error;
    this.code = "internal_server_error";
    this.status = 500;
    this.details = {};
  }

  toResponse(): Response {
    const message = this.error.message;
    return Response.json(
      {
        code: this.code,
        error: {
          message,
          name: this.error.name,
        },
        details: this.details,
      },
      { status: this.status },
    );
  }
}

export class SensitiveContentError extends GatewayError {
  constructor(message: string, opts: ErrorOpts = {}) {
    super(message);
    this.code = "sensitive_content";
    this.details = opts.details ?? {};
    this.status = 400;
  }
}

export class EnglishOnlyError extends GatewayError {
  constructor(message: string, opts: ErrorOpts = {}) {
    super(message);
    this.code = "english_only";
    this.details = opts.details ?? {};
    this.status = 400;
  }
}

export class RateLimitError extends GatewayError {
  constructor(message: string, opts: ErrorOpts = {}) {
    super(message);
    this.code = "rate_limit";
    this.details = opts.details ?? {};
    this.status = 429;
  }
}
export class InvalidParametersError extends GatewayError {
  constructor(message: string, opts: ErrorOpts = {}) {
    super(message);
    this.code = "invalid_parameters";
    this.details = opts.details ?? {};
    this.status = 400;
  }
}
