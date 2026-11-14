import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spelunk } from '../../src/crawl/spelunker.js';
import { createGopherServer } from '../../src/gopher/server.js';

test('spelunker crawls root menu only at depth 0', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Welcome', selector: '', host: '', port: 0 },
        { type: '1', display: 'Subdir', selector: '/subdir', host: '127.0.0.1', port: 0 }
      ]
    },
    '/subdir': {
      type: 'menu',
      items: [
        { type: '0', display: 'file.txt', selector: '/subdir/file.txt', host: '127.0.0.1', port: 0 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  // Update port in content map
  contentMap['/'].items[1].port = port;
  contentMap['/subdir'].items[0].port = port;
  
  try {
    const url = `gopher://127.0.0.1:${port}/1/`;
    const result = await spelunk(url, 0, 50);
    
    // Should only visit the root
    assert.equal(result.visited.length, 1);
    assert.equal(result.visited[0].url, url);
    assert.equal(result.stats.totalVisited, 1);
    assert.equal(result.stats.maxDepth, 0);
  } finally {
    close();
  }
});

test('spelunker crawls one level at depth 1', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Welcome', selector: '', host: '', port: 0 },
        { type: '1', display: 'Subdir', selector: '/subdir', host: '127.0.0.1', port: 0 }
      ]
    },
    '/subdir': {
      type: 'menu',
      items: [
        { type: '0', display: 'file.txt', selector: '/subdir/file.txt', host: '127.0.0.1', port: 0 },
        { type: '1', display: 'Deeper', selector: '/subdir/deeper', host: '127.0.0.1', port: 0 }
      ]
    },
    '/subdir/deeper': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Too deep', selector: '', host: '', port: 0 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  // Update port in content map
  contentMap['/'].items[1].port = port;
  contentMap['/subdir'].items[0].port = port;
  contentMap['/subdir'].items[1].port = port;
  
  try {
    const url = `gopher://127.0.0.1:${port}/1/`;
    const result = await spelunk(url, 1, 50);
    
    // Should visit root and subdir, but not deeper
    assert.equal(result.visited.length, 2);
    assert.equal(result.stats.totalVisited, 2);
    assert.equal(result.stats.maxDepth, 1);
    
    const urls = result.visited.map(v => v.url);
    assert.ok(urls.includes(`gopher://127.0.0.1:${port}/1/`));
    assert.ok(urls.includes(`gopher://127.0.0.1:${port}/1/subdir`));
  } finally {
    close();
  }
});

test('spelunker respects visit limit', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: '1', display: 'Dir1', selector: '/dir1', host: '127.0.0.1', port: 0 },
        { type: '1', display: 'Dir2', selector: '/dir2', host: '127.0.0.1', port: 0 },
        { type: '1', display: 'Dir3', selector: '/dir3', host: '127.0.0.1', port: 0 }
      ]
    },
    '/dir1': {
      type: 'menu',
      items: [
        { type: 'i', display: 'File 1', selector: '', host: '', port: 0 }
      ]
    },
    '/dir2': {
      type: 'menu',
      items: [
        { type: 'i', display: 'File 2', selector: '', host: '', port: 0 }
      ]
    },
    '/dir3': {
      type: 'menu',
      items: [
        { type: 'i', display: 'File 3', selector: '', host: '', port: 0 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  // Update port in content map
  contentMap['/'].items[0].port = port;
  contentMap['/'].items[1].port = port;
  contentMap['/'].items[2].port = port;
  
  try {
    const url = `gopher://127.0.0.1:${port}/1/`;
    const result = await spelunk(url, 10, 2);
    
    // Should stop after visiting 2 URLs (maxVisits = 2)
    assert.equal(result.visited.length, 2);
    assert.equal(result.stats.totalVisited, 2);
  } finally {
    close();
  }
});

test('spelunker detects cycles', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: '1', display: 'DirA', selector: '/dira', host: '127.0.0.1', port: 0 }
      ]
    },
    '/dira': {
      type: 'menu',
      items: [
        { type: '1', display: 'DirB', selector: '/dirb', host: '127.0.0.1', port: 0 }
      ]
    },
    '/dirb': {
      type: 'menu',
      items: [
        { type: '1', display: 'Back to root', selector: '/', host: '127.0.0.1', port: 0 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  // Update port in content map
  contentMap['/'].items[0].port = port;
  contentMap['/dira'].items[0].port = port;
  contentMap['/dirb'].items[0].port = port;
  
  try {
    const url = `gopher://127.0.0.1:${port}/1/`;
    const result = await spelunk(url, 10, 50);
    
    // Should visit root, dira, dirb, but not root again
    assert.equal(result.visited.length, 3);
    assert.equal(result.stats.totalVisited, 3);
    
    const urls = result.visited.map(v => v.url);
    assert.equal(urls[0], `gopher://127.0.0.1:${port}/1/`);
    assert.equal(urls[1], `gopher://127.0.0.1:${port}/1/dira`);
    assert.equal(urls[2], `gopher://127.0.0.1:${port}/1/dirb`);
  } finally {
    close();
  }
});

test('spelunker records outbound links', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Welcome', selector: '', host: '', port: 0 },
        { type: '0', display: 'readme.txt', selector: '/readme.txt', host: '127.0.0.1', port: 0 },
        { type: '1', display: 'Subdir', selector: '/subdir', host: '127.0.0.1', port: 0 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  // Update port in content map
  contentMap['/'].items[1].port = port;
  contentMap['/'].items[2].port = port;
  
  try {
    const url = `gopher://127.0.0.1:${port}/1/`;
    const result = await spelunk(url, 0, 50);
    
    // Should have recorded all links from root menu
    assert.equal(result.visited.length, 1);
    assert.equal(result.visited[0].links.length, 3);
    
    const links = result.visited[0].links;
    assert.equal(links[0].type, 'i');
    assert.equal(links[1].type, '0');
    assert.equal(links[2].type, '1');
    assert.equal(links[1].display, 'readme.txt');
  } finally {
    close();
  }
});

test('spelunker handles network errors gracefully', async () => {
  // Use a port that definitely won't be listening
  const url = 'gopher://127.0.0.1:1/1/';
  const result = await spelunk(url, 1, 50);
  
  // Should have one visited item with an error
  assert.equal(result.visited.length, 1);
  assert.equal(result.visited[0].type, 'error');
  assert.equal(result.stats.errorCount, 1);
});

test('spelunker only follows type 1 directories', async () => {
  const contentMap = {
    '/': {
      type: 'menu',
      items: [
        { type: '0', display: 'file.txt', selector: '/file.txt', host: '127.0.0.1', port: 0 },
        { type: '9', display: 'binary.bin', selector: '/binary.bin', host: '127.0.0.1', port: 0 },
        { type: '1', display: 'Subdir', selector: '/subdir', host: '127.0.0.1', port: 0 }
      ]
    },
    '/subdir': {
      type: 'menu',
      items: [
        { type: 'i', display: 'In subdir', selector: '', host: '', port: 0 }
      ]
    }
  };
  
  const { port, close } = await createGopherServer(contentMap);
  
  // Update port in content map
  contentMap['/'].items[0].port = port;
  contentMap['/'].items[1].port = port;
  contentMap['/'].items[2].port = port;
  
  try {
    const url = `gopher://127.0.0.1:${port}/1/`;
    const result = await spelunk(url, 1, 50);
    
    // Should visit root and subdir, but not file.txt or binary.bin
    assert.equal(result.visited.length, 2);
    
    const urls = result.visited.map(v => v.url);
    assert.ok(urls.includes(`gopher://127.0.0.1:${port}/1/`));
    assert.ok(urls.includes(`gopher://127.0.0.1:${port}/1/subdir`));
  } finally {
    close();
  }
});
