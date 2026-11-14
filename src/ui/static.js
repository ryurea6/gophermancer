#!/usr/bin/env node
/**
 * Gophermancer Static HTML Generator
 * Renders a gopherhole as a self-contained HTML page with necromancer theme
 */

import { gopherBrowse } from '../mcp/tools.js';

// Unicode symbols for item types (same as terminal UI)
const SYMBOLS = {
  '0': '📄',
  '1': '📁',
  '3': '⚠️',
  '7': '🔍',
  '9': '📦',
  'g': '🖼️',
  'I': '🖼️',
  'h': '🌐',
  'i': '💀',
  's': '🔊',
};

/**
 * Get symbol for item type
 * @param {string} type - Gopher item type
 * @returns {string} Unicode symbol
 */
function getSymbol(type) {
  return SYMBOLS[type] || '❓';
}

/**
 * Get CSS class for item type
 * @param {string} type - Gopher item type
 * @returns {string} CSS class name
 */
function getItemClass(type) {
  switch (type) {
    case '0': return 'item-text';
    case '1': return 'item-directory';
    case '3': return 'item-error';
    case '7': return 'item-search';
    case 'i': return 'item-info';
    default: return 'item-other';
  }
}

/**
 * Build a Gopher URL from menu item
 * @param {Object} item - Menu item
 * @returns {string} Gopher URL
 */
function buildUrl(item) {
  const port = item.port === 70 ? '' : `:${item.port}`;
  return `gopher://${item.host}${port}/${item.type}${item.selector}`;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate HTML for a menu
 * @param {Array} items - Menu items
 * @param {string} url - Current URL
 * @returns {string} HTML string
 */
function generateMenuHtml(items, url) {
  let html = '';
  
  for (const item of items) {
    const symbol = getSymbol(item.type);
    const cssClass = getItemClass(item.type);
    const displayText = escapeHtml(item.display);
    
    // Type 'i' (info) and type '3' (error) are not links
    if (item.type === 'i' || item.type === '3') {
      html += `    <li class="${cssClass}">\n`;
      html += `      <span class="symbol">${symbol}</span>\n`;
      html += `      <span class="text">${displayText}</span>\n`;
      html += `    </li>\n`;
    } else {
      const itemUrl = escapeHtml(buildUrl(item));
      html += `    <li class="${cssClass}">\n`;
      html += `      <span class="symbol">${symbol}</span>\n`;
      html += `      <a href="${itemUrl}" class="link">${displayText}</a>\n`;
      html += `    </li>\n`;
    }
  }
  
  return html;
}

/**
 * Generate complete HTML page
 * @param {string} url - Gopher URL
 * @returns {Promise<string>} Complete HTML document
 */
export async function generateHtml(url) {
  try {
    const items = await gopherBrowse(url);
    const escapedUrl = escapeHtml(url);
    const menuHtml = generateMenuHtml(items, url);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gophermancer - ${escapedUrl}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background: #0a0a0a;
      color: #00ff00;
      font-family: 'Courier New', Courier, monospace;
      padding: 2rem;
      line-height: 1.6;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #111;
      border: 2px solid #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }
    
    header {
      background: #000;
      border-bottom: 2px solid #00ff00;
      padding: 1.5rem;
      text-align: center;
    }
    
    h1 {
      font-size: 2rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #00ff00;
      text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: #ffaa00;
      font-size: 0.9rem;
      font-style: italic;
    }
    
    .url-display {
      background: #000;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #333;
      color: #888;
      font-size: 0.85rem;
      word-break: break-all;
    }
    
    main {
      padding: 2rem;
    }
    
    ul {
      list-style: none;
    }
    
    li {
      padding: 0.75rem;
      border-left: 3px solid transparent;
      transition: all 0.2s;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    
    li:hover {
      background: rgba(0, 255, 0, 0.05);
      border-left-color: #00ff00;
    }
    
    .symbol {
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    
    .link {
      color: #ffaa00;
      text-decoration: none;
      transition: all 0.2s;
      flex-grow: 1;
    }
    
    .link:hover {
      color: #ffcc00;
      text-shadow: 0 0 5px rgba(255, 170, 0, 0.5);
    }
    
    .item-text .link {
      color: #ffaa00;
    }
    
    .item-directory .link {
      color: #00ff00;
      font-weight: bold;
    }
    
    .item-search .link {
      color: #ff00ff;
    }
    
    .item-error .text {
      color: #ff0000;
    }
    
    .item-info .text {
      color: #666;
      font-style: italic;
    }
    
    .item-other .link {
      color: #00ffff;
    }
    
    footer {
      background: #000;
      border-top: 2px solid #00ff00;
      padding: 1rem;
      text-align: center;
      color: #666;
      font-size: 0.8rem;
    }
    
    .skull {
      font-size: 3rem;
      text-align: center;
      margin: 1rem 0;
      color: #00ff00;
      text-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
    }
    
    @media (max-width: 768px) {
      body {
        padding: 0.5rem;
      }
      
      main {
        padding: 1rem;
      }
      
      h1 {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="skull">💀</div>
      <h1>Gophermancer</h1>
      <div class="subtitle">The Necromancer's Portal to Gopherspace</div>
    </header>
    
    <div class="url-display">${escapedUrl}</div>
    
    <main>
      <ul>
${menuHtml}
      </ul>
    </main>
    
    <footer>
      <p>Powered by Gophermancer | Resurrecting Gopherspace for AI Agents</p>
      <p style="margin-top: 0.5rem; color: #444;">RFC 1436 + MCP = 💀🔮</p>
    </footer>
  </div>
</body>
</html>`;
  } catch (error) {
    // Generate error page
    const escapedUrl = escapeHtml(url);
    const escapedError = escapeHtml(error.message);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gophermancer - Error</title>
  <style>
    body {
      background: #0a0a0a;
      color: #ff0000;
      font-family: 'Courier New', Courier, monospace;
      padding: 2rem;
      line-height: 1.6;
      text-align: center;
    }
    
    .error-container {
      max-width: 600px;
      margin: 0 auto;
      background: #111;
      border: 2px solid #ff0000;
      padding: 2rem;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
    }
    
    h1 {
      color: #ff0000;
      text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
      margin-bottom: 1rem;
    }
    
    .skull {
      font-size: 4rem;
      margin: 1rem 0;
    }
    
    .url {
      color: #888;
      word-break: break-all;
      margin: 1rem 0;
      font-size: 0.9rem;
    }
    
    .error-message {
      color: #ffaa00;
      margin-top: 1rem;
      padding: 1rem;
      background: #000;
      border: 1px solid #333;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="skull">💀</div>
    <h1>SUMMONING FAILED</h1>
    <p>The spirits could not be reached</p>
    <div class="url">${escapedUrl}</div>
    <div class="error-message">${escapedError}</div>
  </div>
</body>
</html>`;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2];
  
  if (!url) {
    console.error('Usage: node static.js <gopher-url>');
    console.error('Example: node static.js gopher://gopher.floodgap.com/1/');
    process.exit(1);
  }
  
  generateHtml(url)
    .then(html => {
      console.log(html);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}
