/**
 * Gopher Spelunker - recursive gopherhole crawler
 * Uses breadth-first search with depth and visit limits
 */

import { fetch as gopherFetch, parseUrl } from '../gopher/client.js';
import { decodeLines } from '../gopher/codec.js';
import { parseMenu } from '../gopher/parser.js';

/**
 * Build a full Gopher URL from an item
 * @param {object} item - Menu item with host, port, itemType, selector
 * @returns {string} Full gopher:// URL
 */
function buildUrl(item) {
  const type = item.type || '1';
  return `gopher://${item.host}:${item.port}/${type}${item.selector}`;
}

/**
 * Crawl a gopherhole recursively
 * @param {string} startUrl - Starting Gopher URL
 * @param {number} maxDepth - Maximum depth to crawl (0 = only start URL)
 * @param {number} maxVisits - Maximum number of URLs to visit
 * @returns {Promise<object>} SpelunkResult with visited array and stats
 */
export async function spelunk(startUrl, maxDepth = 2, maxVisits = 50) {
  const queue = [{ url: startUrl, depth: 0 }];
  const visited = new Set();
  const results = [];
  let errorCount = 0;

  while (queue.length > 0 && visited.size < maxVisits) {
    const { url, depth } = queue.shift();

    // Skip if already visited
    if (visited.has(url)) {
      continue;
    }

    visited.add(url);

    try {
      // Parse the URL
      const parsed = parseUrl(url);
      if (parsed.error) {
        errorCount++;
        results.push({
          url,
          type: 'error',
          display: parsed.message,
          links: []
        });
        continue;
      }

      // Fetch the item
      const buffer = await gopherFetch(parsed.host, parsed.port, parsed.selector);
      const lines = decodeLines(buffer);

      // Parse based on item type
      // For now, we only crawl menus (type 1)
      // If it's not a menu, we still record it but don't extract links
      let links = [];
      let itemType = parsed.itemType || '1';
      let display = url;

      if (itemType === '1') {
        // It's a menu - parse it
        const menu = parseMenu(lines);
        
        // Extract all links for the results
        links = menu.map(item => {
          const itemUrl = buildUrl(item);
          return {
            url: itemUrl,
            type: item.type,
            display: item.display
          };
        });

        // If we're not at max depth, enqueue directory links
        if (depth < maxDepth) {
          for (const item of menu) {
            // Only follow directories (type 1)
            if (item.type === '1') {
              const itemUrl = buildUrl(item);
              queue.push({ url: itemUrl, depth: depth + 1 });
            }
          }
        }

        // Try to find a good display name
        // Use the first non-info item's display, or the URL
        const firstItem = menu.find(item => item.type !== 'i');
        if (firstItem) {
          display = `Menu: ${firstItem.display.substring(0, 50)}...`;
        } else {
          display = 'Menu';
        }
      }

      results.push({
        url,
        type: itemType,
        display,
        links,
        depth
      });

    } catch (error) {
      errorCount++;
      results.push({
        url,
        type: 'error',
        display: error.message,
        links: [],
        depth
      });
    }
  }

  return {
    visited: results,
    stats: {
      totalVisited: visited.size,
      maxDepth: Math.max(...results.map(r => r.depth || 0), 0),
      errorCount
    }
  };
}
