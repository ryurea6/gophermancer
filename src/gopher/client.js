/**
 * Gopher protocol client
 * Connects to Gopher servers, sends requests, receives responses
 */

import { connect } from 'node:net';
import { encodeRequest } from './codec.js';

const DEFAULT_PORT = 70;
const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch a resource from a Gopher server
 * @param {string} host - Hostname or IP address
 * @param {number} port - Port number
 * @param {string} selector - Selector string
 * @param {number} [timeout=10000] - Timeout in milliseconds
 * @returns {Promise<Buffer>} - Raw response bytes
 */
export function fetch(host, port, selector, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    const socket = connect(port, host);
    
    // Set timeout
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      // Send the request
      const request = encodeRequest(selector);
      socket.write(request);
    });
    
    socket.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    socket.on('end', () => {
      // Connection closed by server, concatenate all chunks
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`Timeout after ${timeout}ms`));
    });
    
    socket.on('error', (err) => {
      reject(new Error(`Failed to connect to ${host}:${port}: ${err.code || err.message}`));
    });
  });
}

/**
 * Parse a Gopher URL into components
 * Format: gopher://host:port/typeSelector
 * @param {string} url - Gopher URL
 * @returns {Object} - { host, port, itemType, selector }
 */
export function parseUrl(url) {
  // Check scheme
  if (!url.startsWith('gopher://')) {
    throw new Error('Unsupported scheme: expected gopher://');
  }
  
  // Remove scheme
  const withoutScheme = url.slice('gopher://'.length);
  
  // Split by first slash
  const slashIndex = withoutScheme.indexOf('/');
  
  let hostPort;
  let pathPart = '';
  
  if (slashIndex === -1) {
    // No path part
    hostPort = withoutScheme;
  } else {
    hostPort = withoutScheme.slice(0, slashIndex);
    pathPart = withoutScheme.slice(slashIndex + 1);
  }
  
  // Parse host and port
  let host;
  let port = DEFAULT_PORT;
  
  if (hostPort.includes(':')) {
    const parts = hostPort.split(':');
    host = parts[0];
    port = parseInt(parts[1], 10);
    if (isNaN(port)) {
      port = DEFAULT_PORT;
    }
  } else {
    host = hostPort;
  }
  
  // Parse item type and selector
  let itemType = '1'; // Default to menu
  let selector = '';
  
  if (pathPart.length > 0) {
    // First character might be the item type
    itemType = pathPart[0];
    selector = pathPart.slice(1);
  }
  
  return {
    host,
    port,
    itemType,
    selector
  };
}
