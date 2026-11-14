/**
 * Tests for static HTML generator
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGopherServer } from '../../src/gopher/server.js';
import { generateHtml } from '../../src/ui/static.js';

test('generateHtml produces valid HTML with DOCTYPE', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '1', display: 'Directory', selector: '/dir', host: 'localhost', port: 7070 },
        { type: '0', display: 'Text file', selector: '/file.txt', host: 'localhost', port: 7070 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'HTML should start with DOCTYPE');
    assert.ok(html.includes('<html'), 'HTML should have html tag');
    assert.ok(html.includes('</html>'), 'HTML should close html tag');
    assert.ok(html.includes('<head>'), 'HTML should have head tag');
    assert.ok(html.includes('<body>'), 'HTML should have body tag');
  } finally {
    await close();
  }
});

test('generateHtml includes embedded CSS', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Info line', selector: '', host: '', port: 0 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.includes('<style>'), 'HTML should have embedded CSS');
    assert.ok(html.includes('background:'), 'CSS should have styling');
    assert.ok(html.includes('</style>'), 'CSS should be closed');
    // Verify necromancer theme colors
    assert.ok(html.includes('#0a0a0a') || html.includes('#000'), 'Should have dark background');
    assert.ok(html.includes('#00ff00'), 'Should have green text (necromancer theme)');
  } finally {
    await close();
  }
});

test('generateHtml renders menu items correctly', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '1', display: 'Subdir', selector: '/sub', host: 'localhost', port: 7070 },
        { type: '0', display: 'Document', selector: '/doc.txt', host: 'localhost', port: 7070 },
        { type: 'i', display: 'Just info', selector: 'fake', host: 'fake', port: 0 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.includes('Subdir'), 'Should include directory name');
    assert.ok(html.includes('Document'), 'Should include document name');
    assert.ok(html.includes('Just info'), 'Should include info text');
  } finally {
    await close();
  }
});

test('generateHtml creates links for selectable items', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '1', display: 'Directory', selector: '/dir', host: 'example.com', port: 70 },
        { type: '0', display: 'File', selector: '/file', host: 'example.com', port: 70 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.includes('href="gopher://example.com/1/dir"'), 'Should have directory link');
    assert.ok(html.includes('href="gopher://example.com/0/file"'), 'Should have file link');
  } finally {
    await close();
  }
});

test('generateHtml does not create links for info lines', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Welcome message', selector: 'fake', host: 'fake', port: 0 },
        { type: '3', display: 'Error happened', selector: 'fake', host: 'fake', port: 0 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    // Info and error items should have text but not be links
    assert.ok(html.includes('Welcome message'), 'Should include info text');
    assert.ok(html.includes('Error happened'), 'Should include error text');
    
    // Count occurrences of href - should only be in the structure, not for these items
    const hrefPattern = /<a href="gopher:\/\//g;
    const matches = html.match(hrefPattern);
    assert.equal(matches, null, 'Info and error items should not be links');
  } finally {
    await close();
  }
});

test('generateHtml escapes HTML special characters', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '0', display: '<script>alert("xss")</script>', selector: '/file', host: 'localhost', port: 7070 },
        { type: 'i', display: 'Text with & and "quotes"', selector: '', host: '', port: 0 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.includes('&lt;script&gt;'), 'Should escape < and >');
    assert.ok(html.includes('&amp;'), 'Should escape ampersand');
    assert.ok(html.includes('&quot;'), 'Should escape quotes');
    assert.ok(!html.includes('<script>alert'), 'Should not include raw script tag');
  } finally {
    await close();
  }
});

test('generateHtml handles non-standard ports in URLs', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '1', display: 'Dir', selector: '/dir', host: 'example.com', port: 7777 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.includes('gopher://example.com:7777/1/dir'), 'Should include non-standard port in URL');
  } finally {
    await close();
  }
});

test('generateHtml omits default port 70 from URLs', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '0', display: 'File', selector: '/file', host: 'example.com', port: 70 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.includes('gopher://example.com/0/file'), 'Should not include :70 for default port');
    assert.ok(!html.includes(':70'), 'Should not have :70 in URLs');
  } finally {
    await close();
  }
});

test('generateHtml returns error page when fetch fails', async () => {
  // Try to connect to a port that doesn't exist
  const html = await generateHtml('gopher://localhost:1/1/');
  
  assert.ok(html.includes('<!DOCTYPE html>'), 'Error page should be valid HTML');
  assert.ok(html.includes('SUMMONING FAILED') || html.includes('Error') || html.includes('error'), 'Should indicate error');
  assert.ok(html.includes('gopher://localhost:1/1/'), 'Should show the URL that failed');
});

test('generateHtml includes title with URL', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: 'i', display: 'Welcome', selector: '', host: '', port: 0 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    assert.ok(html.includes('<title>'), 'Should have title tag');
    assert.ok(html.includes(`localhost:${port}`), 'Title should include URL');
  } finally {
    await close();
  }
});

test('generateHtml includes Unicode symbols for item types', async () => {
  const contentMap = {
    '': {
      type: 'menu',
      items: [
        { type: '1', display: 'Dir', selector: '/dir', host: 'localhost', port: 7070 },
        { type: '0', display: 'Text', selector: '/text', host: 'localhost', port: 7070 },
        { type: '7', display: 'Search', selector: '/search', host: 'localhost', port: 7070 },
        { type: 'i', display: 'Info', selector: '', host: '', port: 0 },
      ]
    }
  };
  
  const { server, port, close } = await createGopherServer(contentMap, 0);
  
  try {
    const html = await generateHtml(`gopher://localhost:${port}/1/`);
    
    // Check for Unicode symbols (various item types use emoji)
    assert.ok(html.includes('📁') || html.includes('📄') || html.includes('🔍') || html.includes('💀'), 
      'Should include Unicode symbols for item types');
  } finally {
    await close();
  }
});
