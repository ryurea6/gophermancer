import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGopherServer } from '../../src/gopher/server.js';
import { connect } from 'node:net';

// Helper to send a request and get response
function sendRequest(host, port, selector) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const socket = connect(port, host);
    
    socket.on('connect', () => {
      socket.write(selector + '\r\n');
    });
    
    socket.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    socket.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    socket.on('error', reject);
  });
}

test('server serves a menu', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Welcome', selector: '', host: '', port: 0 },
        { type: '1', display: 'Documents', selector: '/docs', host: 'localhost', port: 70 },
        { type: '0', display: 'readme.txt', selector: '/readme.txt', host: 'localhost', port: 70 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const response = await sendRequest('127.0.0.1', port, '/');
    const text = response.toString('utf8');
    
    // Verify response contains all menu items
    assert.match(text, /iWelcome\t\t\t0\r\n/);
    assert.match(text, /1Documents\t\/docs\tlocalhost\t70\r\n/);
    assert.match(text, /0readme\.txt\t\/readme\.txt\tlocalhost\t70\r\n/);
  } finally {
    await close();
  }
});

test('server serves text document with terminator', async () => {
  const contentMap = {
    '/readme.txt': {
      type: 'text',
      content: 'This is line 1\nThis is line 2\nThis is line 3'
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const response = await sendRequest('127.0.0.1', port, '/readme.txt');
    const text = response.toString('utf8');
    
    // Verify lines and terminator
    assert.match(text, /This is line 1\r\n/);
    assert.match(text, /This is line 2\r\n/);
    assert.match(text, /This is line 3\r\n/);
    assert.match(text, /\.\r\n$/);
  } finally {
    await close();
  }
});

test('server text terminator comes after content', async () => {
  const contentMap = {
    '/file.txt': {
      type: 'text',
      content: 'First\nSecond'
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const response = await sendRequest('127.0.0.1', port, '/file.txt');
    const text = response.toString('utf8');
    
    // Should end with .\r\n
    assert.ok(text.endsWith('.\r\n'));
    
    // Parse to verify structure
    const lines = text.split('\r\n');
    assert.equal(lines[0], 'First');
    assert.equal(lines[1], 'Second');
    assert.equal(lines[2], '.');
  } finally {
    await close();
  }
});

test('server serves binary data without terminator', async () => {
  const binaryData = Buffer.from([0x00, 0x01, 0x02, 0xFF, 0xFE]);
  
  const contentMap = {
    '/binary': {
      type: 'binary',
      data: binaryData
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const response = await sendRequest('127.0.0.1', port, '/binary');
    
    // Verify exact bytes
    assert.deepEqual(response, binaryData);
    
    // Verify no terminator
    assert.notEqual(response[response.length - 2], 0x0D);
    assert.notEqual(response[response.length - 1], 0x0A);
  } finally {
    await close();
  }
});

test('server returns error for nonexistent selector', async () => {
  const contentMap = {
    '/exists': {
      type: 'text',
      content: 'Hello'
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const response = await sendRequest('127.0.0.1', port, '/notfound');
    const text = response.toString('utf8');
    
    // Should be a type 3 error
    assert.match(text, /^3/);
    assert.match(text, /Selector not found/);
    assert.match(text, /error\.host/);
  } finally {
    await close();
  }
});

test('server handles empty selector', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '1', display: 'Root', selector: '/', host: 'localhost', port: 70 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const response = await sendRequest('127.0.0.1', port, '');
    const text = response.toString('utf8');
    
    assert.match(text, /1Root/);
  } finally {
    await close();
  }
});

test('server handles multiple requests sequentially', async () => {
  const contentMap = {
    '/1': { type: 'text', content: 'First' },
    '/2': { type: 'text', content: 'Second' }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const response1 = await sendRequest('127.0.0.1', port, '/1');
    const response2 = await sendRequest('127.0.0.1', port, '/2');
    
    assert.match(response1.toString('utf8'), /First/);
    assert.match(response2.toString('utf8'), /Second/);
  } finally {
    await close();
  }
});

test('server tolerates LF-only request', async () => {
  const contentMap = {
    '/test': {
      type: 'text',
      content: 'Works'
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    // Send request with LF only
    const response = await new Promise((resolve, reject) => {
      const chunks = [];
      const socket = connect(port, '127.0.0.1');
      
      socket.on('connect', () => {
        socket.write('/test\n'); // LF only
      });
      
      socket.on('data', (chunk) => chunks.push(chunk));
      socket.on('end', () => resolve(Buffer.concat(chunks)));
      socket.on('error', reject);
    });
    
    const text = response.toString('utf8');
    assert.match(text, /Works/);
  } finally {
    await close();
  }
});
