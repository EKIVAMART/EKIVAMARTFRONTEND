import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeApiError } from '../lib/api-error.ts';

const responseError = (status, data, headers = {}) => ({
  response: { status, data, headers },
  config: { url: '/auth/register?private=value', method: 'post', data: { password: 'never-log-this' } },
});

test('preserves the actual account conflict and request ID without request secrets', () => {
  const result = normalizeApiError(responseError(409, { message: 'Email already registered', code: 'EMAIL_EXISTS' }, { 'x-request-id': 'req-123' }));
  assert.equal(result.message, 'Email already registered');
  assert.equal(result.code, 'EMAIL_EXISTS');
  assert.equal(result.requestId, 'req-123');
  assert.equal(result.path, '/auth/register');
  assert.equal(result.method, 'POST');
  assert.doesNotMatch(JSON.stringify(result), /private|never-log-this/);
});

test('explains field-level validation when the server message is generic', () => {
  const result = normalizeApiError(responseError(422, { message: 'An unexpected error occurred', errors: [{ field: 'phoneNumber', message: 'Enter a valid phone number' }] }));
  assert.equal(result.message, 'phoneNumber: Enter a valid phone number');
});

test('supports map-shaped validation errors', () => {
  assert.equal(normalizeApiError(responseError(400, { errors: { email: ['Email is required'] } })).message, 'email: Email is required');
});

test('distinguishes offline, timeouts, and network failures with no response property', () => {
  assert.equal(normalizeApiError({ code: 'ERR_NETWORK' }, true).code, 'OFFLINE');
  assert.match(normalizeApiError({ code: 'ETIMEDOUT' }).message, /timed out/);
  assert.match(normalizeApiError({ code: 'ECONNABORTED' }).message, /timed out/);
  const network = normalizeApiError({ code: 'ERR_NETWORK', message: 'Network Error' });
  assert.match(network.message, /No response was received/);
  assert.equal(network.statusCode, undefined);
});

test('does not mislabel client exceptions as HTTP 500', () => {
  const result = normalizeApiError(new Error('Invalid response format'));
  assert.equal(result.message, 'Invalid response format');
  assert.equal(result.statusCode, undefined);
  assert.equal(result.code, 'CLIENT_REQUEST_FAILED');
});

test('rate limits include a server-provided retry interval', () => {
  const result = normalizeApiError(responseError(429, {}, { 'retry-after': '45' }));
  assert.equal(result.retryAfter, 45);
  assert.match(result.message, /45 seconds/);
});

test('server failures expose HTTP status and correlation reference, not an invented cause', () => {
  const result = normalizeApiError(responseError(503, { message: 'Internal server error' }, { 'x-correlation-id': 'trace-7' }));
  assert.match(result.message, /HTTP 503/);
  assert.match(result.message, /trace-7/);
});

test('nested server errors retain their reason and code', () => {
  const result = normalizeApiError(responseError(400, { error: { code: 'REGISTRATION_PENDING', message: 'Please verify your email' } }));
  assert.equal(result.message, 'Please verify your email');
  assert.equal(result.code, 'REGISTRATION_PENDING');
});

test('missing routes identify the endpoint', () => {
  assert.match(normalizeApiError(responseError(404, {})).message, /\/auth\/register.*HTTP 404/);
});

test('unknown failures state exactly which diagnostic information is absent', () => {
  assert.match(normalizeApiError(null).message, /without an HTTP response or a diagnostic message/);
});

test('keeps reasons and status when an API helper rethrows a normalized failure', () => {
  const first = normalizeApiError(responseError(409, { message: 'Email already registered', code: 'EMAIL_EXISTS' }));
  const second = normalizeApiError(first);
  assert.equal(second.message, first.message);
  assert.equal(second.statusCode, 409);
  assert.equal(second.code, 'EMAIL_EXISTS');
});

test('field errors take priority over an unhelpful validation summary', () => {
  assert.equal(normalizeApiError(responseError(422, { message: 'Validation failed', errors: { email: ['Enter a valid email'] } })).message, 'email: Enter a valid email');
});
