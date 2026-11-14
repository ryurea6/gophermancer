import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gopherBrowse, gopherFetch, gopherSearch } from '../../src/mcp/tools.js';
import { createGopherServer } from '../../src/gopher/server.js';

test('gopherBrowse returns menu items', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Welcome to test server', selector: '', host: '', port: 0 },
        { type: '1', display: 'Documents', selector: '/docs', host: 'localhost', port: 70 },
        { type: '0', display: 'readme.txt', selector: '/readme.txt', host: 'localhost', port: 70 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const url = `gopher://127.0.0.1:${port}/1/`;
    const menu = await gopherBrowse(url);
    
    assert.equal(menu.length, 3);
    assert.equal(menu[0].type, 'i');
    assert.equal(menu[0].display, 'Welcome to test server');
    assert.equal(menu[1].type, '1');
    assert.equal(menu[1].display, 'Documents');
    assert.equal(menu[2].type, '0');
    assert.equal(menu[2].display, 'readme.txt');
  } finally {
    close();
  }
});

test('gopherBrowse handles invalid URL', async () => {
  await assert.rejects(
    async () => await gopherBrowse('http://example.com'),
    { message: /Unsupported scheme/ }
  );
});

test('gopherFetch returns text content', async () => {
  const contentMap = {
    '/readme.txt': {
      type: 'text',
      content: 'This is the readme.\nSecond line.\nThird line.'
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const url = `gopher://127.0.0.1:${port}/0/readme.txt`;
    const text = await gopherFetch(url);
    
    assert.equal(text, 'This is the readme.\nSecond line.\nThird line.');
  } finally {
    close();
  }
});

test('gopherFetch handles missing document', async () => {
  const contentMap = {};
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const url = `gopher://127.0.0.1:${port}/0/nonexistent.txt`;
    const text = await gopherFetch(url);
    
    // Server returns error as text
    assert.match(text, /not found/i);
  } finally {
    close();
  }
});

test('gopherSearch appends query to selector', async () => {
  const contentMap = {
    '/search\tgopher': {
      type: 'menu',
      items: [
        { type: '0', display: 'Gopher Protocol RFC', selector: '/rfc1436.txt', host: 'example.com', port: 70 },
        { type: '1', display: 'Gopher Servers', selector: '/servers', host: 'example.com', port: 70 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const url = `gopher://127.0.0.1:${port}/7/search`;
    const results = await gopherSearch(url, 'gopher');
    
    assert.equal(results.length, 2);
    assert.equal(results[0].display, 'Gopher Protocol RFC');
    assert.equal(results[1].display, 'Gopher Servers');
  } finally {
    close();
  }
});

test('gopherSearch handles no results', async () => {
  const contentMap = {
    '/search\tnonexistent': {
      type: 'menu',
      items: []
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  try {
    const url = `gopher://127.0.0.1:${port}/7/search`;
    const results = await gopherSearch(url, 'nonexistent');
    
    assert.equal(results.length, 0);
  } finally {
    close();
  }
});
