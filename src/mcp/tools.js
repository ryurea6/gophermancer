/**
 * MCP Tools for Gopher protocol operations
 */

import { fetch as gopherFetchRaw, parseUrl } from '../gopher/client.js';
import { decodeLines } from '../gopher/codec.js';
import { parseMenu, parseText } from '../gopher/parser.js';
import { spelunk as spelunkCrawl } from '../crawl/spelunker.js';

/**
 * Browse a Gopher menu
 * @param {string} url - Gopher URL (e.g., gopher://example.com:70/1/)
 * @returns {Promise<Array>} Array of menu items
 */
export async function gopherBrowse(url) {
  // Parse URL
  const parsed = parseUrl(url);
  if (parsed.error) {
    throw new Error(parsed.message);
  }

  // Fetch the menu
  const buffer = await gopherFetchRaw(parsed.host, parsed.port, parsed.selector);
  
  // Decode and parse
  const lines = decodeLines(buffer);
  const menu = parseMenu(lines);
  
  return menu;
}

/**
 * Fetch a Gopher text document
 * @param {string} url - Gopher URL (e.g., gopher://example.com:70/0/file.txt)
 * @returns {Promise<string>} Text content
 */
export async function gopherFetch(url) {
  // Parse URL
  const parsed = parseUrl(url);
  if (parsed.error) {
    throw new Error(parsed.message);
  }

  // Fetch the text document
  const buffer = await gopherFetchRaw(parsed.host, parsed.port, parsed.selector);
  
  // Decode and parse
  const lines = decodeLines(buffer);
  const textLines = parseText(lines);
  
  // Join lines with newlines
  return textLines.join('\n');
}

/**
 * Search a Gopher search server
 * @param {string} url - Gopher URL of search server (e.g., gopher://example.com:70/7/search)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of menu items (search results)
 */
export async function gopherSearch(url, query) {
  // Parse URL
  const parsed = parseUrl(url);
  if (parsed.error) {
    throw new Error(parsed.message);
  }

  // For search servers, append tab + query to selector
  const searchSelector = parsed.selector + '\t' + query;
  
  // Fetch the search results (which are returned as a menu)
  const buffer = await gopherFetchRaw(parsed.host, parsed.port, searchSelector);
  
  // Decode and parse as menu
  const lines = decodeLines(buffer);
  const menu = parseMenu(lines);
  
  return menu;
}

/**
 * Crawl a gopherhole recursively
 * @param {string} url - Starting Gopher URL
 * @param {number} maxDepth - Maximum depth to crawl
 * @param {number} maxVisits - Maximum number of URLs to visit
 * @returns {Promise<object>} Spelunk result with visited array and stats
 */
export async function gopherSpelunk(url, maxDepth = 2, maxVisits = 50) {
  return await spelunkCrawl(url, maxDepth, maxVisits);
}
