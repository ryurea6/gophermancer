/**
 * Gopher menu and text document parser
 */

/**
 * Parse a Gopher menu from lines
 * @param {string[]} lines - Array of lines from the response
 * @returns {Object[]} - Array of menu items with { type, display, selector, host, port }
 */
export function parseMenu(lines) {
  const items = [];
  
  for (const line of lines) {
    // Skip empty lines
    if (line.length === 0) continue;
    
    // First character is the item type
    const type = line[0];
    const rest = line.slice(1);
    
    // Split by tabs
    const parts = rest.split('\t');
    
    // Extract fields, treating missing fields as empty strings
    const display = parts[0] || '';
    const selector = parts[1] || '';
    const host = parts[2] || '';
    const portStr = parts[3] || '';
    const port = portStr ? parseInt(portStr, 10) : 0;
    
    items.push({
      type,
      display,
      selector,
      host,
      port: isNaN(port) ? 0 : port
    });
  }
  
  return items;
}

/**
 * Parse a Gopher text document
 * Stops at the single '.' terminator line
 * @param {string[]} lines - Array of lines from the response
 * @returns {string[]} - Array of text lines (without the terminator)
 */
export function parseText(lines) {
  const result = [];
  
  for (const line of lines) {
    // Single period on a line by itself is the terminator
    if (line === '.') break;
    result.push(line);
  }
  
  return result;
}
