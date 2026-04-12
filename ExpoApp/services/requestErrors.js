export const TRANSIENT_STATUS_CODES = [408, 425, 429, 500, 502, 503, 504]

export function createRequestError({ message, endpoint, status, code, retryable, operation, cause }) {
  const error = new Error(message || 'Request failed.')
  error.name = 'RequestError'
  error.endpoint = endpoint || ''
  error.status = status ?? null
  error.code = code || (status ? `HTTP_${status}` : 'REQUEST_FAILED')
  error.retryable = Boolean(retryable)
  error.operation = operation || 'unknown'
  if (cause) error.cause = cause
  return error
}

export function isAuthError(error) {
  return error?.status === 401 || error?.status === 403
}

export function isRetryableStatus(status) {
  return TRANSIENT_STATUS_CODES.includes(status)
}
