import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetch, parseUrl } from '../../src/gopher/client.js';
import { createServer } from 'node:net';

// Helper to create a simple test server
function createTestServer(responseData) {
  return new Promise((resolve) => {
    const server = createServer((socket) => {
      let data = '';
      
      socket.on('data', (chunk) => {
        data += chunk.toString();
        
        // When we receive CRLF, send response and close
        if (data.includes('\r\n')) {
          socket.write(responseData);
          socket.end();
        }
      });
    });
    
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

// Client fetch tests
test('fetch retrieves data from server', async () => {
  const responseData = '0File\tfile.txt\thost\t70\r\n';
  const { server, port } = await createTestServer(responseData);
  
  try {
    const buffer = await fetch('127.0.0.1', port, '/test');
    assert.equal(buffer.toString('utf8'), responseData);
  } finally {
    server.close();
  }
});

test('fetch handles empty selector', async () => {
  const responseData = '1Menu\t/\thost\t70\r\n';
  const { server, port } = await createTestServer(responseData);
  
  try {
    const buffer = await fetch('127.0.0.1', port, '');
    assert.equal(buffer.toString('utf8'), responseData);
  } finally {
    server.close();
  }
});

test('fetch rejects on connection refused', async () => {
  await assert.rejects(
    async () => {
      await fetch('127.0.0.1', 1, '/test', 1000);
    },
    (err) => {
      return err.message.includes('refused') || err.message.includes('ECONNREFUSED');
    }
  );
});

test('fetch rejects on timeout', async () => {
  // Create a server that never responds
  const server = createServer((socket) => {
    // Just keep the connection open
  });
  
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  
  const port = server.address().port;
  
  try {
    await assert.rejects(
      async () => {
        await fetch('127.0.0.1', port, '/test', 500);
      },
      (err) => {
        return err.message.includes('Timeout');
      }
    );
  } finally {
    server.close();
  }
});

test('fetch rejects on invalid hostname', async () => {
  await assert.rejects(
    async () => {
      await fetch('invalid.test.nonexistent', 70, '/test', 1000);
    },
    (err) => {
      return err.message.includes('invalid.test.nonexistent');
    }
  );
});

// URL parser tests
test('parseUrl parses complete URL', () => {
  const result = parseUrl('gopher://gopher.example.com:70/1/path/to/item');
  
  assert.equal(result.host, 'gopher.example.com');
  assert.equal(result.port, 70);
  assert.equal(result.itemType, '1');
  assert.equal(result.selector, '/path/to/item');
});

test('parseUrl uses default port 70', () => {
  const result = parseUrl('gopher://gopher.example.com/0/file.txt');
  
  assert.equal(result.host, 'gopher.example.com');
  assert.equal(result.port, 70);
  assert.equal(result.itemType, '0');
  assert.equal(result.selector, '/file.txt');
});

test('parseUrl uses default type 1 when no path', () => {
  const result = parseUrl('gopher://gopher.example.com:70');
  
  assert.equal(result.host, 'gopher.example.com');
  assert.equal(result.port, 70);
  assert.equal(result.itemType, '1');
  assert.equal(result.selector, '');
});

test('parseUrl uses default type 1 with empty path', () => {
  const result = parseUrl('gopher://gopher.example.com:70/');
  
  assert.equal(result.host, 'gopher.example.com');
  assert.equal(result.port, 70);
  assert.equal(result.itemType, '1');
  assert.equal(result.selector, '');
});

test('parseUrl handles URL with just host', () => {
  const result = parseUrl('gopher://gopher.example.com');
  
  assert.equal(result.host, 'gopher.example.com');
  assert.equal(result.port, 70);
  assert.equal(result.itemType, '1');
  assert.equal(result.selector, '');
});

test('parseUrl throws on non-gopher scheme', () => {
  assert.throws(
    () => parseUrl('http://example.com'),
    (err) => {
      return err.message.includes('Unsupported scheme');
    }
  );
});

test('parseUrl handles type 0 text file', () => {
  const result = parseUrl('gopher://host:70/0/readme.txt');
  
  assert.equal(result.itemType, '0');
  assert.equal(result.selector, '/readme.txt');
});

test('parseUrl handles type 7 search', () => {
  const result = parseUrl('gopher://host:70/7/search');
  
  assert.equal(result.itemType, '7');
  assert.equal(result.selector, '/search');
});

test('parseUrl handles IPv4 address', () => {
  const result = parseUrl('gopher://127.0.0.1:7070/1/');
  
  assert.equal(result.host, '127.0.0.1');
  assert.equal(result.port, 7070);
});
