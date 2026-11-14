import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dispatch, handleInitialize, handleToolsList } from '../../src/mcp/server.js';

test('handleInitialize returns protocol version and capabilities', () => {
  const result = handleInitialize({});
  
  assert.equal(result.protocolVersion, '2024-11-05');
  assert.ok(result.capabilities);
  assert.ok(result.capabilities.tools);
  assert.equal(result.serverInfo.name, 'gophermancer');
  assert.equal(result.serverInfo.version, '1.0.0');
});

test('handleToolsList returns all four tools', () => {
  const result = handleToolsList();
  
  assert.ok(result.tools);
  assert.equal(result.tools.length, 4);
  
  const names = result.tools.map(t => t.name);
  assert.ok(names.includes('gopher_browse'));
  assert.ok(names.includes('gopher_fetch'));
  assert.ok(names.includes('gopher_search'));
  assert.ok(names.includes('gopher_spelunk'));
});

test('dispatch handles initialize request', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {}
  };
  
  const response = await dispatch(request);
  
  assert.equal(response.jsonrpc, '2.0');
  assert.equal(response.id, 1);
  assert.ok(response.result);
  assert.equal(response.result.protocolVersion, '2024-11-05');
});

test('dispatch handles tools/list request', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  const response = await dispatch(request);
  
  assert.equal(response.jsonrpc, '2.0');
  assert.equal(response.id, 2);
  assert.ok(response.result);
  assert.equal(response.result.tools.length, 4);
});

test('dispatch returns error for unknown method', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 3,
    method: 'unknown/method',
    params: {}
  };
  
  const response = await dispatch(request);
  
  assert.equal(response.jsonrpc, '2.0');
  assert.equal(response.id, 3);
  assert.ok(response.error);
  assert.equal(response.error.code, -32601);
  assert.match(response.error.message, /Method not found/);
});

test('dispatch returns error for invalid jsonrpc version', async () => {
  const request = {
    jsonrpc: '1.0',
    id: 4,
    method: 'initialize',
    params: {}
  };
  
  const response = await dispatch(request);
  
  assert.equal(response.jsonrpc, '2.0');
  assert.equal(response.id, 4);
  assert.ok(response.error);
  assert.equal(response.error.code, -32600);
  assert.match(response.error.message, /Invalid Request/);
});

test('dispatch handles tools/call with invalid tool name', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'nonexistent_tool',
      arguments: {}
    }
  };
  
  const response = await dispatch(request);
  
  assert.equal(response.jsonrpc, '2.0');
  assert.equal(response.id, 5);
  assert.ok(response.result);
  assert.equal(response.result.isError, true);
  assert.ok(response.result.content[0].text.includes('Unknown tool'));
});

test('tool schemas have required fields', () => {
  const result = handleToolsList();
  
  for (const tool of result.tools) {
    assert.ok(tool.name, 'Tool must have name');
    assert.ok(tool.description, 'Tool must have description');
    assert.ok(tool.inputSchema, 'Tool must have inputSchema');
    assert.equal(tool.inputSchema.type, 'object', 'inputSchema must be object type');
    assert.ok(tool.inputSchema.properties, 'inputSchema must have properties');
    assert.ok(tool.inputSchema.required, 'inputSchema must have required array');
  }
});

test('gopher_browse schema is valid', () => {
  const result = handleToolsList();
  const browseTool = result.tools.find(t => t.name === 'gopher_browse');
  
  assert.ok(browseTool);
  assert.ok(browseTool.inputSchema.properties.url);
  assert.equal(browseTool.inputSchema.properties.url.type, 'string');
  assert.deepEqual(browseTool.inputSchema.required, ['url']);
});

test('gopher_search schema has query parameter', () => {
  const result = handleToolsList();
  const searchTool = result.tools.find(t => t.name === 'gopher_search');
  
  assert.ok(searchTool);
  assert.ok(searchTool.inputSchema.properties.url);
  assert.ok(searchTool.inputSchema.properties.query);
  assert.deepEqual(searchTool.inputSchema.required, ['url', 'query']);
});

test('gopher_spelunk schema has optional maxDepth and maxVisits', () => {
  const result = handleToolsList();
  const spelunkTool = result.tools.find(t => t.name === 'gopher_spelunk');
  
  assert.ok(spelunkTool);
  assert.ok(spelunkTool.inputSchema.properties.url);
  assert.ok(spelunkTool.inputSchema.properties.maxDepth);
  assert.ok(spelunkTool.inputSchema.properties.maxVisits);
  assert.deepEqual(spelunkTool.inputSchema.required, ['url']);
  assert.equal(spelunkTool.inputSchema.properties.maxDepth.default, 2);
  assert.equal(spelunkTool.inputSchema.properties.maxVisits.default, 50);
});

test('dispatch handles tools/call with invalid URL', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: {
      name: 'gopher_browse',
      arguments: {
        url: 'http://example.com'
      }
    }
  };
  
  const response = await dispatch(request);
  
  assert.equal(response.jsonrpc, '2.0');
  assert.equal(response.id, 6);
  assert.ok(response.result);
  assert.equal(response.result.isError, true);
  assert.ok(response.result.content[0].text.includes('Unsupported scheme'));
});
