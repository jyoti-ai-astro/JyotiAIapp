import assert from 'node:assert/strict'

import { sanitizeLogPayload } from '../lib/logging/sanitize-log-payload'

function testSensitiveFieldsAreRedacted() {
  const sanitized = sanitizeLogPayload({
    source: 'razorpay',
    Authorization: 'Bearer live-token',
    xRazorpaySignature: 'signed-payload',
    nested: {
      key_secret: 'rzp_secret',
      webhookSecret: 'whsec',
      apiKey: 'api-key',
    },
  }) as any

  assert.equal(sanitized.source, 'razorpay')
  assert.equal(sanitized.Authorization, '[REDACTED]')
  assert.equal(sanitized.xRazorpaySignature, '[REDACTED]')
  assert.equal(sanitized.nested.key_secret, '[REDACTED]')
  assert.equal(sanitized.nested.webhookSecret, '[REDACTED]')
  assert.equal(sanitized.nested.apiKey, '[REDACTED]')
}

function testFirestoreUnsafeShapesAreNormalized() {
  const payload: any = {
    safe: true,
    missing: undefined,
    values: ['ok', undefined, 'kept'],
  }
  payload.self = payload

  const sanitized = sanitizeLogPayload(payload) as any

  assert.equal(sanitized.safe, true)
  assert.equal('missing' in sanitized, false)
  assert.deepEqual(sanitized.values, ['ok', 'kept'])
  assert.equal(sanitized.self, '[Circular]')
}

function testOversizedValuesAreBoundedWithoutLosingDates() {
  const createdAt = new Date('2026-09-06T00:00:00.000Z')
  const sanitized = sanitizeLogPayload({
    createdAt,
    message: 'x'.repeat(1200),
    samples: Array.from({ length: 60 }, (_, index) => index),
  }) as any

  assert.equal(sanitized.createdAt, createdAt)
  assert.equal(sanitized.message.length, 1000)
  assert.equal(sanitized.samples.length, 50)
}

function testErrorsKeepOperationalContext() {
  const error = new Error('Payment webhook reconciliation failed')
  error.stack = 'stack-frame\n'.repeat(200)

  const sanitized = sanitizeLogPayload({ error }) as any

  assert.equal(sanitized.error.name, 'Error')
  assert.equal(sanitized.error.message, 'Payment webhook reconciliation failed')
  assert.equal(sanitized.error.stack.length, 1000)
}

function testErrorsWithoutStacksDoNotRetainUndefinedFields() {
  const error = new Error('Stack unavailable')
  delete error.stack

  const sanitized = sanitizeLogPayload({ error }) as any

  assert.equal(sanitized.error.name, 'Error')
  assert.equal(sanitized.error.message, 'Stack unavailable')
  assert.equal('stack' in sanitized.error, false)
}

function main() {
  testSensitiveFieldsAreRedacted()
  testFirestoreUnsafeShapesAreNormalized()
  testOversizedValuesAreBoundedWithoutLosingDates()
  testErrorsKeepOperationalContext()
  testErrorsWithoutStacksDoNotRetainUndefinedFields()
}

main()
