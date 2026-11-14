#!/usr/bin/env node
/**
 * Gophermancer Terminal UI - The Necromancer's Console
 * A terminal interface for browsing Gopherspace
 */

import * as readline from 'node:readline';
import { gopherBrowse, gopherFetch, gopherSearch } from '../mcp/tools.js';
import { parseUrl } from '../gopher/client.js';

// ANSI color codes - necromancer theme
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Necromancer palette
  green: '\x1b[32m',      // Primary text
  amber: '\x1b[33m',      // Links
  cyan: '\x1b[36m',       // Info
  red: '\x1b[31m',        // Errors
  magenta: '\x1b[35m',    // Search
  gray: '\x1b[90m',       // Dim text
};

// Unicode symbols for item types
const SYMBOLS = {
  '0': '📄',  // Text file
  '1': '📁',  // Directory
  '3': '⚠️',  // Error
  '7': '🔍',  // Search
  '9': '📦',  // Binary
  'g': '🖼️',  // GIF
  'I': '🖼️',  // Image
  'h': '🌐',  // HTML
  'i': '💀',  // Info line (necromancer theme)
  's': '🔊',  // Sound
};

/**
 * Get a display symbol and color for an item type
 * @param {string} type - Gopher item type
 * @returns {Object} { symbol, color }
 */
function getItemStyle(type) {
  const symbol = SYMBOLS[type] || '❓';
  let color;
  
  switch (type) {
    case '0': color = COLORS.amber; break;
    case '1': color = COLORS.green; break;
    case '3': color = COLORS.red; break;
    case '7': color = COLORS.magenta; break;
    case 'i': color = COLORS.gray; break;
    default: color = COLORS.cyan; break;
  }
  
  return { symbol, color };
}

/**
 * Render a menu to the terminal
 * @param {Array} items - Menu items from gopherBrowse
 * @param {string} currentUrl - Current URL for context
 */
function renderMenu(items, currentUrl) {
  console.log('\n' + COLORS.bright + COLORS.green + '═'.repeat(70) + COLORS.reset);
  console.log(COLORS.bright + COLORS.green + '  GOPHERMANCER - THE NECROMANCER\'S CONSOLE' + COLORS.reset);
  console.log(COLORS.gray + '  ' + currentUrl + COLORS.reset);
  console.log(COLORS.bright + COLORS.green + '═'.repeat(70) + COLORS.reset + '\n');
  
  let selectableIndex = 0;
  
  for (const item of items) {
    const { symbol, color } = getItemStyle(item.type);
    
    // Type 'i' (info) and type '3' (error) are not selectable
    if (item.type === 'i' || item.type === '3') {
      console.log(`  ${symbol}  ${color}${item.display}${COLORS.reset}`);
    } else {
      selectableIndex++;
      const numStr = String(selectableIndex).padStart(2, ' ');
      console.log(`${COLORS.cyan}[${numStr}]${COLORS.reset} ${symbol}  ${color}${item.display}${COLORS.reset}`);
    }
  }
  
  console.log('\n' + COLORS.gray + '  [number] to select, [b]ack, [q]uit' + COLORS.reset);
}

/**
 * Render text content to the terminal
 * @param {string} text - Text content
 * @param {string} title - Title/URL for context
 */
function renderText(text, title) {
  console.log('\n' + COLORS.bright + COLORS.green + '═'.repeat(70) + COLORS.reset);
  console.log(COLORS.bright + COLORS.green + '  TEXT DOCUMENT' + COLORS.reset);
  console.log(COLORS.gray + '  ' + title + COLORS.reset);
  console.log(COLORS.bright + COLORS.green + '═'.repeat(70) + COLORS.reset + '\n');
  
  console.log(COLORS.green + text + COLORS.reset);
  
  console.log('\n' + COLORS.gray + '  Press Enter to continue...' + COLORS.reset);
}

/**
 * Build a Gopher URL from menu item
 * @param {Object} item - Menu item with type, selector, host, port
 * @returns {string} Gopher URL
 */
function buildUrl(item) {
  const port = item.port === 70 ? '' : `:${item.port}`;
  return `gopher://${item.host}${port}/${item.type}${item.selector}`;
}

/**
 * Get selectable items from a menu
 * @param {Array} items - All menu items
 * @returns {Array} Selectable items only (excluding type 'i' and '3')
 */
function getSelectableItems(items) {
  return items.filter(item => item.type !== 'i' && item.type !== '3');
}

/**
 * Main navigation loop
 */
async function navigate(startUrl) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const history = []; // Navigation history for back button
  let currentUrl = startUrl;
  
  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
  
  while (true) {
    try {
      // Parse current URL to determine type
      const parsed = parseUrl(currentUrl);
      
      // Fetch and display based on type
      if (parsed.itemType === '1') {
        // Directory - fetch and display menu
        const items = await gopherBrowse(currentUrl);
        renderMenu(items, currentUrl);
        
        const selectableItems = getSelectableItems(items);
        
        // Wait for user input
        const input = await question('\n> ');
        const trimmed = input.trim().toLowerCase();
        
        if (trimmed === 'q' || trimmed === 'quit') {
          console.log('\n' + COLORS.green + '  Returning to the grave...' + COLORS.reset + '\n');
          rl.close();
          break;
        } else if (trimmed === 'b' || trimmed === 'back') {
          if (history.length > 0) {
            currentUrl = history.pop();
          } else {
            console.log(COLORS.red + '  Already at the beginning.' + COLORS.reset);
          }
        } else {
          // Try to parse as number
          const num = parseInt(trimmed, 10);
          if (!isNaN(num) && num >= 1 && num <= selectableItems.length) {
            const selectedItem = selectableItems[num - 1];
            const nextUrl = buildUrl(selectedItem);
            
            // Handle search type
            if (selectedItem.type === '7') {
              const query = await question(COLORS.magenta + '  Search query: ' + COLORS.reset);
              if (query.trim()) {
                history.push(currentUrl);
                currentUrl = nextUrl;
                
                // Perform search
                const results = await gopherSearch(nextUrl, query.trim());
                renderMenu(results, `${nextUrl} (query: ${query.trim()})`);
                
                // Get selectable search results
                const searchSelectableItems = getSelectableItems(results);
                const resultInput = await question('\n> ');
                const resultTrimmed = resultInput.trim().toLowerCase();
                
                if (resultTrimmed === 'b' || resultTrimmed === 'back') {
                  currentUrl = history.pop();
                } else {
                  const resultNum = parseInt(resultTrimmed, 10);
                  if (!isNaN(resultNum) && resultNum >= 1 && resultNum <= searchSelectableItems.length) {
                    const resultItem = searchSelectableItems[resultNum - 1];
                    history.push(currentUrl);
                    currentUrl = buildUrl(resultItem);
                  }
                }
              }
            } else {
              // Regular navigation
              history.push(currentUrl);
              currentUrl = nextUrl;
            }
          } else if (trimmed) {
            console.log(COLORS.red + `  Invalid selection: ${trimmed}` + COLORS.reset);
          }
        }
      } else if (parsed.itemType === '0') {
        // Text file - fetch and display
        const text = await gopherFetch(currentUrl);
        renderText(text, currentUrl);
        
        await question('');
        
        // Go back after viewing text
        if (history.length > 0) {
          currentUrl = history.pop();
        } else {
          // No history, exit
          rl.close();
          break;
        }
      } else {
        // Unsupported type
        console.log(COLORS.red + `  Unsupported item type: ${parsed.itemType}` + COLORS.reset);
        console.log(COLORS.gray + '  Supported types: 0 (text), 1 (menu), 7 (search)' + COLORS.reset);
        
        if (history.length > 0) {
          currentUrl = history.pop();
        } else {
          rl.close();
          break;
        }
      }
    } catch (error) {
      // Handle errors gracefully
      console.log('\n' + COLORS.red + '  Error: ' + error.message + COLORS.reset);
      console.log(COLORS.gray + '  Press Enter to continue...' + COLORS.reset);
      await question('');
      
      // Go back on error
      if (history.length > 0) {
        currentUrl = history.pop();
      } else {
        // No history, ask if they want to quit
        const retry = await question(COLORS.yellow + '  Try again? (y/n): ' + COLORS.reset);
        if (retry.trim().toLowerCase() !== 'y') {
          rl.close();
          break;
        }
      }
    }
  }
}

// Main entry point
const url = process.argv[2];

if (!url) {
  console.error(COLORS.red + 'Usage: node terminal.js <gopher-url>' + COLORS.reset);
  console.error(COLORS.gray + 'Example: node terminal.js gopher://gopher.floodgap.com/1/' + COLORS.reset);
  process.exit(1);
}

navigate(url).catch((error) => {
  console.error(COLORS.red + '\nFatal error: ' + error.message + COLORS.reset);
  process.exit(1);
});
