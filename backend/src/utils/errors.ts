export class AppError extends Error {
  public status: number;
  public type: string;
  public code: string;

  constructor(message: string, status: number, code: string, type: string = 'api_error') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.type = type;
    this.code = code;
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        type: this.type,
        code: this.code,
        status: this.status,
      },
    };
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 401, 'invalid_api_key', 'authentication_error');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'rate_limit_exceeded', 'rate_limit_error');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'invalid_request', 'validation_error');
  }
}

export class ProviderError extends AppError {
  constructor(message: string, status = 502) {
    super(message, status, 'provider_error', 'upstream_error');
  }
}

type ConfigurationErrorDetails = {
  missingEnvironmentVariables?: string[];
  fieldErrors?: Record<string, string[]>;
};

export class ConfigurationError extends AppError {
  public details?: ConfigurationErrorDetails;

  constructor(message = 'Service is misconfigured', details?: ConfigurationErrorDetails) {
    super(message, 503, 'service_misconfigured', 'configuration_error');
    this.details = details;
  }

  toJSON() {
    const base = super.toJSON();

    return {
      error: {
        ...base.error,
        ...(this.details?.missingEnvironmentVariables?.length
          ? { missing_environment_variables: this.details.missingEnvironmentVariables }
          : {}),
        ...(this.details?.fieldErrors && Object.keys(this.details.fieldErrors).length
          ? { field_errors: this.details.fieldErrors }
          : {}),
      },
    };
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'not_found', 'not_found_error');
  }
}

export function normalizeProviderError(status: number, body: string): AppError {
  let message = body;
  try {
    const parsed = JSON.parse(body);
    message = parsed.error?.message || parsed.detail || parsed.message || body;
  } catch {
    // use raw body
  }

  if (status === 401) {
    return new ProviderError(`Provider authentication failed: ${message}`, 502);
  }
  if (status === 429) {
    return new ProviderError(`Provider rate limit: ${message}`, 429);
  }
  if (status >= 500) {
    return new ProviderError(`Provider server error: ${message}`, 502);
  }
  return new ProviderError(`Provider error (${status}): ${message}`, status >= 400 ? status : 502);
}
