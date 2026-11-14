/**
 * End-to-end test for the demo gopherhole
 * Tests the full stack: server, client, and MCP tools
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGopherServer } from '../../src/gopher/server.js';
import { demoContent } from '../../demo/content.js';
import { gopherBrowse, gopherFetch, gopherSearch, gopherSpelunk } from '../../src/mcp/tools.js';

test('E2E: Browse demo root menu', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const items = await gopherBrowse(`gopher://localhost:${port}/1/`);
    
    assert.ok(items.length > 0, 'Should have menu items');
    assert.ok(items.some(item => item.display.includes('GOPHERMANCER')), 'Should have welcome message');
    assert.ok(items.some(item => item.type === '1'), 'Should have directory items');
    assert.ok(items.some(item => item.type === '0'), 'Should have text file items');
    assert.ok(items.some(item => item.type === '7'), 'Should have search item');
  } finally {
    await close();
  }
});

test('E2E: Browse library submenu', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const items = await gopherBrowse(`gopher://localhost:${port}/1/library`);
    
    assert.ok(items.length > 0, 'Should have menu items');
    assert.ok(items.some(item => item.display.includes('LIBRARY')), 'Should have library header');
    assert.ok(items.some(item => item.display.includes('Introduction')), 'Should have intro document');
  } finally {
    await close();
  }
});

test('E2E: Fetch manifesto text document', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const text = await gopherFetch(`gopher://localhost:${port}/0/manifesto.txt`);
    
    assert.ok(text.length > 0, 'Should have text content');
    assert.ok(text.includes('GOPHERMANCER MANIFESTO'), 'Should have manifesto title');
    assert.ok(text.includes('1991'), 'Should mention Gopher birth year');
    assert.ok(text.includes('2024'), 'Should mention resurrection year');
  } finally {
    await close();
  }
});

test('E2E: Fetch RFC 1436 text document', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const text = await gopherFetch(`gopher://localhost:${port}/0/rfc1436.txt`);
    
    assert.ok(text.includes('RFC 1436'), 'Should have RFC reference');
    assert.ok(text.includes('CRLF'), 'Should mention CRLF');
    assert.ok(text.includes('selector'), 'Should mention selectors');
  } finally {
    await close();
  }
});

test('E2E: Search for "gopher"', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const results = await gopherSearch(`gopher://localhost:${port}/7/search`, 'gopher');
    
    assert.ok(results.length > 0, 'Should have search results');
    assert.ok(results.some(item => item.display.includes('SCRYING POOL')), 'Should have search header');
    
    // Should find the RFC document
    const foundRFC = results.some(item => item.display.includes('RFC') || item.display.includes('Burial'));
    assert.ok(foundRFC, 'Should find RFC document in search results');
  } finally {
    await close();
  }
});

test('E2E: Search for "mcp"', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const results = await gopherSearch(`gopher://localhost:${port}/7/search`, 'mcp');
    
    assert.ok(results.length > 0, 'Should have search results');
    const foundMCP = results.some(item => item.display.includes('MCP') || item.display.includes('Modern'));
    assert.ok(foundMCP, 'Should find MCP document in search results');
  } finally {
    await close();
  }
});

test('E2E: Search for nonexistent term', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const results = await gopherSearch(`gopher://localhost:${port}/7/search`, 'xyznonexistent');
    
    assert.ok(results.length > 0, 'Should have response even with no results');
    assert.ok(results.some(item => item.display.includes('nothing') || item.display.includes('Nothing')), 
      'Should indicate no results found');
  } finally {
    await close();
  }
});

test('E2E: Spelunk demo gopherhole with depth 1', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const result = await gopherSpelunk(`gopher://localhost:${port}/1/`, 1, 20);
    
    assert.ok(result.visited.length > 0, 'Should visit URLs');
    assert.ok(result.stats, 'Should have stats');
    assert.ok(result.stats.totalVisited >= 1, 'Should have visited count');
    
    // Should visit the root
    const visitedRoot = result.visited.some(v => v.url.includes('localhost'));
    assert.ok(visitedRoot, 'Should visit the root URL');
  } finally {
    await close();
  }
});

test('E2E: Spelunk demo gopherhole with depth 2', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const result = await gopherSpelunk(`gopher://localhost:${port}/1/`, 2, 50);
    
    assert.ok(result.visited.length > 1, 'Should visit multiple URLs');
    
    // Should visit both root and at least one submenu
    const depths = result.visited.map(v => v.depth);
    assert.ok(depths.includes(0), 'Should visit depth 0');
    assert.ok(depths.includes(1), 'Should visit depth 1');
  } finally {
    await close();
  }
});

test('E2E: Verify restricted section structure', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const items = await gopherBrowse(`gopher://localhost:${port}/1/library/restricted`);
    
    assert.ok(items.some(item => item.type === '3'), 'Should have error item (access denied)');
    assert.ok(items.some(item => item.display.includes('Necronomicon')), 'Should have forbidden item');
  } finally {
    await close();
  }
});

test('E2E: Fetch spell documents', async () => {
  const { server, port, close } = await createGopherServer(demoContent, 0);
  
  try {
    const sockets = await gopherFetch(`gopher://localhost:${port}/0/spells/sockets.txt`);
    assert.ok(sockets.includes('TCP'), 'Sockets document should mention TCP');
    assert.ok(sockets.includes('node:net'), 'Should have code examples');
    
    const crlf = await gopherFetch(`gopher://localhost:${port}/0/spells/crlf.txt`);
    assert.ok(crlf.includes('CRLF'), 'CRLF document should explain line endings');
    assert.ok(crlf.includes('\\r\\n'), 'Should show CRLF representation');
  } finally {
    await close();
  }
});
