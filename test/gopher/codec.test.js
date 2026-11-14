import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeRequest, decodeLines } from '../../src/gopher/codec.js';

test('encodeRequest adds CRLF to selector', () => {
  const result = encodeRequest('/path/to/file');
  assert.equal(result, '/path/to/file\r\n');
});

test('encodeRequest handles empty selector', () => {
  const result = encodeRequest('');
  assert.equal(result, '\r\n');
});

test('encodeRequest enforces CRLF', () => {
  const result = encodeRequest('test');
  const bytes = Buffer.from(result, 'utf8');
  // Last two bytes must be 0x0D 0x0A
  assert.equal(bytes[bytes.length - 2], 0x0D);
  assert.equal(bytes[bytes.length - 1], 0x0A);
});

test('decodeLines splits by CRLF', () => {
  const buffer = Buffer.from('line1\r\nline2\r\nline3\r\n', 'utf8');
  const lines = decodeLines(buffer);
  assert.deepEqual(lines, ['line1', 'line2', 'line3', '']);
});

test('decodeLines tolerates LF-only line endings', () => {
  const buffer = Buffer.from('line1\nline2\nline3\n', 'utf8');
  const lines = decodeLines(buffer);
  assert.deepEqual(lines, ['line1', 'line2', 'line3', '']);
});

test('decodeLines handles mixed line endings', () => {
  const buffer = Buffer.from('line1\r\nline2\nline3\r\n', 'utf8');
  const lines = decodeLines(buffer);
  assert.deepEqual(lines, ['line1', 'line2', 'line3', '']);
});

test('decodeLines handles empty buffer', () => {
  const buffer = Buffer.from('', 'utf8');
  const lines = decodeLines(buffer);
  assert.deepEqual(lines, ['']);
});
