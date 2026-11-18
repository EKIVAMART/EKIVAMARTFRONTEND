export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  requestId?: string;
  method?: string;
  path?: string;
  retryAfter?: number;
  errors?: Record<string, string[]> | Array<{ field: string; message: string }>;
}

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
  value && typeof value === 'object' ? value as RecordValue : {};
const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;
const generic = /^(an? )?(unexpected |internal |unknown )?(server )?error( occurred)?[.!]?$/i;

export function normalizeApiError(error: unknown, offline = false): ApiError {
  const source = record(error);
  const response = record(source.response);
  const data = record(response.data);
  const nested = record(data.error);
  const config = record(source.config);
  const headers = record(response.headers);
  const statusCode = typeof response.status === 'number' ? response.status
    : typeof source.statusCode === 'number' ? source.statusCode : undefined;
  const code = text(data.code) || text(nested.code) || text(source.code);
  const serverMessage = text(data.message) || text(nested.message) || text(data.error)
    || (statusCode ? text(source.message) : undefined);
  const requestId = text(headers['x-request-id']) || text(headers['x-correlation-id']) || text(data.requestId) || text(source.requestId);
  let path: string | undefined;
  try { if (text(config.url)) path = new URL(String(config.url), 'https://local.invalid').pathname; } catch { path = undefined; }
  const details: ApiError = {
    message: '', statusCode, code, requestId, path,
    method: text(config.method)?.toUpperCase(),
  };
  if (data.errors && typeof data.errors === 'object') details.errors = data.errors as ApiError['errors'];
  const retrySeconds = Number.parseInt(String(headers['retry-after']), 10);
  const retryDate = Date.parse(String(headers['retry-after']));
  if (statusCode === 429) details.retryAfter = Number.isFinite(retrySeconds)
    ? Math.max(0, retrySeconds)
    : Number.isFinite(retryDate) ? Math.max(0, Math.ceil((retryDate - Date.now()) / 1000)) : undefined;

  if (serverMessage && !generic.test(serverMessage) && !((statusCode === 400 || statusCode === 422) && details.errors)) {
    details.message = serverMessage;
  } else if (statusCode === 400 || statusCode === 422) {
    const validation = Array.isArray(details.errors)
      ? details.errors.map(item => `${item.field}: ${item.message}`).join('; ')
      : details.errors ? Object.entries(details.errors).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`).join('; ') : '';
    details.message = validation || `The server rejected the submitted details (HTTP ${statusCode}). No field-level reason was returned.`;
  } else if (statusCode === 401) {
    details.message = path === '/auth/login' ? 'The email or password was not accepted. Check your details and try again.' : 'Your session is missing or has expired. Sign in again.';
  } else if (statusCode === 403) {
    details.message = 'Your account does not have permission to perform this action.';
  } else if (statusCode === 404) {
    details.message = `The requested service${path ? ` (${path})` : ''} was not found (HTTP 404).`;
  } else if (statusCode === 409) {
    details.message = 'The request conflicts with an existing record (HTTP 409). The server did not specify which record.';
  } else if (statusCode === 429) {
    details.message = `Too many attempts.${details.retryAfter ? ` Try again in ${details.retryAfter} seconds.` : ' Wait a moment before trying again.'}`;
  } else if (statusCode && statusCode >= 500) {
    details.message = `The server could not complete this request (HTTP ${statusCode}).${requestId ? ` Support reference: ${requestId}.` : ' No diagnostic reference was returned; server logs are needed to identify the cause.'}`;
  } else if (offline) {
    details.code = 'OFFLINE';
    details.message = 'Your device is offline. Reconnect to the internet and try again.';
  } else if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
    details.message = 'The server did not respond before the request timed out. Check whether the action completed before retrying.';
  } else if (code === 'ERR_NETWORK' || source.request) {
    details.code = code || 'NO_RESPONSE';
    details.message = 'No response was received from the API. The connection failed or the browser blocked it. The browser Network panel can identify which.';
  } else if (statusCode) {
    details.message = `The request was rejected with HTTP ${statusCode}. The server did not return a reason.`;
  } else {
    details.code = code || 'CLIENT_REQUEST_FAILED';
    details.message = text(source.message) && !generic.test(String(source.message))
      ? String(source.message)
      : 'The request failed in the app without an HTTP response or a diagnostic message.';
  }
  return details;
}
