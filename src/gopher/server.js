/**
 * Gopher protocol server
 * Serves menus, text documents, and binary data
 */

import { createServer } from 'node:net';

const CRLF = '\r\n';

/**
 * Create and start a Gopher server
 * @param {Object} contentMap - Map of selectors to content objects
 * @param {number} [port=0] - Port to listen on (0 = random available port)
 * @returns {Promise<Object>} - { server, port, close }
 */
export function createGopherServer(contentMap, port = 0) {
  return new Promise((resolve, reject) => {
    const server = createServer((socket) => {
      let requestData = '';
      
      socket.on('data', (chunk) => {
        requestData += chunk.toString('utf8');
        
        // Wait until we have a complete line (CRLF or LF)
        if (requestData.includes('\n')) {
          // Extract the selector (everything before the first CRLF or LF)
          const lines = requestData.split(/\r?\n/);
          const selector = lines[0];
          
          // Look up the content
          const content = contentMap[selector];
          
          if (!content) {
            // Send error response
            const errorLine = `3Selector not found: ${selector}\terror\terror.host\t0${CRLF}`;
            socket.write(errorLine);
            socket.end();
            return;
          }
          
          // Serve based on content type
          if (content.type === 'menu') {
            serveMenu(socket, content.items);
          } else if (content.type === 'text') {
            serveText(socket, content.content);
          } else if (content.type === 'binary') {
            serveBinary(socket, content.data);
          } else {
            // Unknown type, send error
            const errorLine = `3Unknown content type${CRLF}`;
            socket.write(errorLine);
            socket.end();
          }
        }
      });
      
      socket.on('error', (err) => {
        // Ignore socket errors (client disconnects, etc.)
      });
    });
    
    server.on('error', reject);
    
    server.listen(port, '127.0.0.1', () => {
      const actualPort = server.address().port;
      
      resolve({
        server,
        port: actualPort,
        close: () => {
          return new Promise((resolveClose) => {
            server.close(() => resolveClose());
          });
        }
      });
    });
  });
}

/**
 * Serve a menu
 * @param {Socket} socket - Client socket
 * @param {Object[]} items - Array of menu items
 */
function serveMenu(socket, items) {
  for (const item of items) {
    const line = `${item.type}${item.display}\t${item.selector}\t${item.host}\t${item.port}${CRLF}`;
    socket.write(line);
  }
  socket.end();
}

/**
 * Serve a text document
 * @param {Socket} socket - Client socket
 * @param {string} content - Text content (may contain \n for line breaks)
 */
function serveText(socket, content) {
  const lines = content.split('\n');
  
  for (const line of lines) {
    socket.write(line + CRLF);
  }
  
  // Send terminator
  socket.write('.' + CRLF);
  socket.end();
}

/**
 * Serve binary data
 * @param {Socket} socket - Client socket
 * @param {Buffer} data - Binary data
 */
function serveBinary(socket, data) {
  socket.write(data);
  socket.end();
}
