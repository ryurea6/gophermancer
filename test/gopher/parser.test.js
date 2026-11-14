import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMenu, parseText } from '../../src/gopher/parser.js';

// Menu parser tests
test('parseMenu extracts all fields from valid menu lines', () => {
  const lines = [
    '0File\tfile.txt\thost.example\t70',
    '1Directory\t/subdir\thost.example\t70',
    'iInfo line\tfake\terror.host\t0'
  ];
  
  const items = parseMenu(lines);
  
  assert.equal(items.length, 3);
  
  assert.equal(items[0].type, '0');
  assert.equal(items[0].display, 'File');
  assert.equal(items[0].selector, 'file.txt');
  assert.equal(items[0].host, 'host.example');
  assert.equal(items[0].port, 70);
  
  assert.equal(items[1].type, '1');
  assert.equal(items[1].display, 'Directory');
  assert.equal(items[1].selector, '/subdir');
  
  assert.equal(items[2].type, 'i');
  assert.equal(items[2].display, 'Info line');
});

test('parseMenu tolerates malformed lines with missing tabs', () => {
  const lines = [
    'iInfo text with only one tab\tfake',
    '0Text with two tabs\tfile.txt\thost.example',
    '1Only display text'
  ];
  
  const items = parseMenu(lines);
  
  assert.equal(items.length, 3);
  
  // Line with one tab: display and selector present, host and port missing
  assert.equal(items[0].type, 'i');
  assert.equal(items[0].display, 'Info text with only one tab');
  assert.equal(items[0].selector, 'fake');
  assert.equal(items[0].host, '');
  assert.equal(items[0].port, 0);
  
  // Line with two tabs: missing port
  assert.equal(items[1].type, '0');
  assert.equal(items[1].port, 0);
  
  // Line with no tabs: only display text
  assert.equal(items[2].type, '1');
  assert.equal(items[2].display, 'Only display text');
  assert.equal(items[2].selector, '');
});

test('parseMenu handles empty lines', () => {
  const lines = [
    '0File\tfile.txt\thost\t70',
    '',
    '1Dir\t/dir\thost\t70'
  ];
  
  const items = parseMenu(lines);
  
  // Empty lines are skipped
  assert.equal(items.length, 2);
  assert.equal(items[0].type, '0');
  assert.equal(items[1].type, '1');
});

test('parseMenu handles invalid port numbers', () => {
  const lines = [
    '0File\tfile.txt\thost\tinvalid',
    '1Dir\t/dir\thost\t'
  ];
  
  const items = parseMenu(lines);
  
  assert.equal(items[0].port, 0);
  assert.equal(items[1].port, 0);
});

// Text parser tests
test('parseText stops at terminator', () => {
  const lines = [
    'Line 1',
    'Line 2',
    '.',
    'Line after terminator'
  ];
  
  const result = parseText(lines);
  
  assert.deepEqual(result, ['Line 1', 'Line 2']);
});

test('parseText includes lines starting with period if not sole period', () => {
  const lines = [
    'Line 1',
    '.profile',
    '.bashrc',
    '.',
    'After terminator'
  ];
  
  const result = parseText(lines);
  
  assert.deepEqual(result, ['Line 1', '.profile', '.bashrc']);
});

test('parseText handles immediate terminator', () => {
  const lines = ['.'];
  
  const result = parseText(lines);
  
  assert.deepEqual(result, []);
});

test('parseText handles no terminator', () => {
  const lines = ['Line 1', 'Line 2', 'Line 3'];
  
  const result = parseText(lines);
  
  // Returns all lines if no terminator found
  assert.deepEqual(result, ['Line 1', 'Line 2', 'Line 3']);
});

test('parseText handles empty input', () => {
  const lines = [];
  
  const result = parseText(lines);
  
  assert.deepEqual(result, []);
});
