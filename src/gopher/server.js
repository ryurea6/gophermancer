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
          const rawSelector = lines[0];
          
          // Check for search query (selector with tab)
          let selector = rawSelector;
          let query = null;
          const tabIndex = rawSelector.indexOf('\t');
          if (tabIndex !== -1) {
            selector = rawSelector.slice(0, tabIndex);
            query = rawSelector.slice(tabIndex + 1);
          }
          
          // Look up the content. The root selector is the empty string (RFC 1436), but
          // gopherholes in the wild also write it as "/", and a selector written without its
          // leading slash names the same node, so try those spellings before giving up.
          const content =
            contentMap[selector] ??
            (selector === '' ? contentMap['/'] : undefined) ??
            (selector === '/' ? contentMap[''] : undefined) ??
            contentMap[selector.startsWith('/') ? selector.slice(1) : `/${selector}`];
          
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
            // Support both 'content' (old) and 'lines' (new) formats
            const textContent = content.lines ? content.lines.join('\n') : content.content;
            serveText(socket, textContent);
          } else if (content.type === 'binary') {
            serveBinary(socket, content.data);
          } else if (content.type === 'search') {
            // Handle search query
            if (query && content.handler) {
              const results = content.handler(query);
              serveMenu(socket, results);
            } else {
              // No query provided, show search prompt
              const promptLine = `iEnter a search query${CRLF}`;
              socket.write(promptLine);
              socket.end();
            }
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
