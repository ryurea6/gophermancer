#!/usr/bin/env node
/**
 * MCP Server for Gophermancer
 * Implements JSON-RPC 2.0 over stdio transport
 * Exposes Gopher protocol operations as MCP tools
 */

import * as readline from 'node:readline';
import { gopherBrowse, gopherFetch, gopherSearch, gopherSpelunk } from './tools.js';

const PROTOCOL_VERSION = '2024-11-05';

const SERVER_INFO = {
  name: 'gophermancer',
  version: '1.0.0'
};

const TOOL_SCHEMAS = [
  {
    name: 'gopher_browse',
    description: 'Browse a Gopher menu (item type 1). Returns a list of menu items with their type, display text, selector, host, and port.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Gopher URL of the menu (e.g., gopher://gopher.floodgap.com:70/1/)'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'gopher_fetch',
    description: 'Fetch a Gopher text document (item type 0). Returns the text content as a string.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Gopher URL of the text document (e.g., gopher://example.com:70/0/file.txt)'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'gopher_search',
    description: 'Submit a query to a Gopher search server (item type 7). Returns a menu of search results.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Gopher URL of the search server (e.g., gopher://gopher.floodgap.com:70/7/v2/vs)'
        },
        query: {
          type: 'string',
          description: 'Search query string'
        }
      },
      required: ['url', 'query']
    }
  },
  {
    name: 'gopher_spelunk',
    description: 'Crawl a gopherhole recursively and return a map of discovered items. Follows directory links (type 1) up to a specified depth and visit limit.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Starting Gopher URL (typically a menu, e.g., gopher://example.com:70/1/)'
        },
        maxDepth: {
          type: 'integer',
          description: 'Maximum depth to crawl (0 = only the starting URL, 1 = one level of links, etc.)',
          default: 2,
          minimum: 0
        },
        maxVisits: {
          type: 'integer',
          description: 'Maximum number of URLs to visit (to prevent runaway crawls)',
          default: 50,
          minimum: 1
        }
      },
      required: ['url']
    }
  }
];

/**
 * Handle the initialize request
 * @param {object} params - Request parameters
 * @returns {object} Initialize result
 */
function handleInitialize(params) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {
      tools: {}
    },
    serverInfo: SERVER_INFO
  };
}

/**
 * Handle the tools/list request
 * @returns {object} Tools list result
 */
function handleToolsList() {
  return {
    tools: TOOL_SCHEMAS
  };
}

/**
 * Handle the tools/call request
 * @param {object} params - Request parameters with name and arguments
 * @returns {Promise<object>} Tool call result
 */
async function handleToolsCall(params) {
  const { name, arguments: args } = params;

  try {
    let result;
    
    switch (name) {
      case 'gopher_browse':
        result = await gopherBrowse(args.url);
        break;
      case 'gopher_fetch':
        result = await gopherFetch(args.url);
        break;
      case 'gopher_search':
        result = await gopherSearch(args.url, args.query);
        break;
      case 'gopher_spelunk':
        result = await gopherSpelunk(
          args.url,
          args.maxDepth ?? 2,
          args.maxVisits ?? 50
        );
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Format result as MCP content
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    // Return error in MCP format
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Dispatch a JSON-RPC request to the appropriate handler
 * @param {object} request - JSON-RPC request
 * @returns {Promise<object>} JSON-RPC response
 */
async function dispatch(request) {
  const { jsonrpc, id, method, params } = request;

  // Validate JSON-RPC version
  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id: id ?? null,
      error: {
        code: -32600,
        message: 'Invalid Request: jsonrpc must be "2.0"'
      }
    };
  }

  try {
    let result;

    switch (method) {
      case 'initialize':
        result = handleInitialize(params);
        break;
      case 'tools/list':
        result = handleToolsList();
        break;
      case 'tools/call':
        result = await handleToolsCall(params);
        break;
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        };
    }

    return {
      jsonrpc: '2.0',
      id,
      result
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: `Internal error: ${error.message}`
      }
    };
  }
}

/**
 * Send a JSON-RPC response to stdout
 * @param {object} response - JSON-RPC response
 */
function sendResponse(response) {
  console.log(JSON.stringify(response));
}

/**
 * Main server loop: read JSON-RPC requests from stdin, dispatch, send responses
 */
function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (!line.trim()) {
      return; // Skip empty lines
    }

    let request;
    try {
      request = JSON.parse(line);
    } catch (error) {
      const response = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error: Invalid JSON'
        }
      };
      sendResponse(response);
      return;
    }

    const response = await dispatch(request);
    sendResponse(response);
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

// Run the server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { dispatch, handleInitialize, handleToolsList, handleToolsCall };
