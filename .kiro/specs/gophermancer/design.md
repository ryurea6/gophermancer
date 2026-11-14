# Gophermancer Design

This document describes the architecture, data models, and algorithms.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ MCP Server (stdio transport, JSON-RPC)                      │
│  ├─ tools: gopher_browse, gopher_fetch, gopher_search, ...  │
│  └─ calls into Gopher Client and Spelunker                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│ Gopher Client (node:net)                                    │
│  ├─ connect(host, port, selector) -> bytes                  │
│  └─ uses Codec and Parser                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐           ┌────────▼────────┐
│ Codec          │           │ Parser          │
│  encode(sel)   │           │  parseMenu()    │
│  decode(bytes) │           │  parseText()    │
└────────────────┘           └─────────────────┘
                                      │
                       ┌──────────────┴──────────────┐
                       │                             │
              ┌────────▼────────┐          ┌─────────▼────────┐
              │ Spelunker       │          │ Renderers        │
              │  crawl()        │          │  terminal.js     │
              │  follow links   │          │  static.js       │
              │  respect limits │          │  (shared data)   │
              └─────────────────┘          └──────────────────┘
```

The system has five layers:

1. **Gopher Codec**: Encodes selectors and decodes byte streams, enforcing CRLF line endings.
2. **Gopher Parser**: Parses menu and text responses into structured data.
3. **Gopher Client**: Opens TCP connections, sends requests, receives responses.
4. **Gopher Server**: Listens for connections, serves menus, text, and binary data.
5. **MCP Server**: Exposes Gopher operations as MCP tools over stdio.
6. **Spelunker**: Crawls gopherholes recursively, respecting depth and visit limits.
7. **Renderers**: Terminal UI and static HTML generator consume the same parsed data.

## Data models

### GopherItem

Represents a single menu item.

```javascript
{
  type: '0',                    // single-character item type
  display: 'Welcome to Gopher', // human-readable text
  selector: '/welcome.txt',     // selector string
  host: 'gopher.example.com',   // hostname or IP
  port: 70                      // port number (integer)
}
```

### GopherMenu

An array of `GopherItem` objects.

### GopherTextDocument

An array of strings, one per line (without CRLF).

### GopherURL

A parsed Gopher URL.

```javascript
{
  host: 'gopher.example.com',
  port: 70,
  itemType: '1',         // inferred from the path or explicit
  selector: '/path/to/item'
}
```

Gopher URLs follow the format:  
`gopher://<host>:<port>/<item-type><selector>`

Example: `gopher://gopher.floodgap.com:70/1/`

If the item type is omitted, default to `1` (menu).

### SpelunkResult

The result of a crawl.

```javascript
{
  visited: [
    {
      url: 'gopher://host:70/1/',
      type: '1',
      display: 'Root Menu',
      links: [
        { url: 'gopher://host:70/0/file.txt', type: '0', display: 'A file' },
        { url: 'gopher://host:70/1/subdir', type: '1', display: 'Subdir' }
      ]
    },
    {
      url: 'gopher://host:70/1/subdir',
      type: '1',
      display: 'Subdir',
      links: [...]
    }
  ],
  stats: {
    totalVisited: 2,
    maxDepth: 1,
    errorCount: 0
  }
}
```

## Gopher wire codec

### Encoding a request

```javascript
function encodeRequest(selector) {
  return selector + '\r\n';
}
```

### Decoding a response

The codec does not interpret the response (menu vs. text vs. binary). It only splits by CRLF:

```javascript
function decodeLines(buffer) {
  const text = buffer.toString('utf8');
  // Split by CRLF or LF (for robustness)
  return text.split(/\r?\n/);
}
```

The parser interprets the lines based on the expected item type.

## Menu parser

The parser splits each line by tabs and extracts the five fields:

```javascript
function parseLine(line) {
  const type = line[0] || '';
  const rest = line.slice(1);
  const parts = rest.split('\t');
  return {
    type,
    display: parts[0] || '',
    selector: parts[1] || '',
    host: parts[2] || '',
    port: parseInt(parts[3], 10) || 0
  };
}
```

If a line has no type character (empty line), skip it.

If a line has fewer than four tabs, treat missing fields as empty strings (R5).

## Text parser

The parser returns lines until it sees a line containing only `.`:

```javascript
function parseText(lines) {
  const result = [];
  for (const line of lines) {
    if (line === '.') break;
    result.push(line);
  }
  return result;
}
```

## MCP tool schemas

### gopher_browse

Fetches and parses a Gopher menu.

```json
{
  "name": "gopher_browse",
  "description": "Browse a Gopher menu (item type 1). Returns a list of menu items.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "Gopher URL of the menu (e.g., gopher://example.com:70/1/path)"
      }
    },
    "required": ["url"]
  }
}
```

**Returns**: Array of `GopherItem` objects.

### gopher_fetch

Fetches a text document.

```json
{
  "name": "gopher_fetch",
  "description": "Fetch a Gopher text document (item type 0). Returns the text content.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "Gopher URL of the text document"
      }
    },
    "required": ["url"]
  }
}
```

**Returns**: String (the text content, with CRLF and terminator removed).

### gopher_search

Submits a query to a Gopher search server (type 7).

```json
{
  "name": "gopher_search",
  "description": "Submit a query to a Gopher search server (item type 7). Returns a menu of results.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "Gopher URL of the search server"
      },
      "query": {
        "type": "string",
        "description": "Search query string"
      }
    },
    "required": ["url", "query"]
  }
}
```

**Returns**: Array of `GopherItem` objects.

### gopher_spelunk

Crawls a gopherhole recursively.

```json
{
  "name": "gopher_spelunk",
  "description": "Crawl a gopherhole recursively and return a map of discovered items. Follows directory links (type 1) up to a specified depth.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "Starting Gopher URL (typically a menu)"
      },
      "maxDepth": {
        "type": "integer",
        "description": "Maximum depth to crawl (0 = only the starting URL, 1 = one level of links, etc.)",
        "default": 2
      },
      "maxVisits": {
        "type": "integer",
        "description": "Maximum number of URLs to visit (to prevent runaway crawls)",
        "default": 50
      }
    },
    "required": ["url"]
  }
}
```

**Returns**: `SpelunkResult` object.

## Crawl algorithm (Spelunker)

The spelunker uses breadth-first search to crawl a gopherhole.

**Inputs**:
- `startUrl`: the Gopher URL to start from.
- `maxDepth`: maximum depth to crawl.
- `maxVisits`: maximum number of URLs to visit.

**Algorithm**:

1. Initialize a queue with `{ url: startUrl, depth: 0 }`.
2. Initialize a visited set (to avoid cycles).
3. Initialize a results array.
4. While the queue is not empty and `visited.size < maxVisits`:
   a. Dequeue `{ url, depth }`.
   b. If `url` is in the visited set, skip it.
   c. Add `url` to the visited set.
   d. Fetch the item at `url`.
   e. Record the item's type, display string, and URL in the results.
   f. If the item is a menu (type 1) and `depth < maxDepth`:
      - Parse the menu.
      - For each menu item of type 1 (directory), enqueue `{ url: itemUrl, depth: depth + 1 }`.
   g. Record outbound links (all menu items, not just directories).
5. Return the results array and stats.

**Limits**:
- If `visited.size >= maxVisits`, stop.
- If `depth >= maxDepth`, do not follow any more links from that item.

**Error handling**:
- If fetching an item fails (network error), record the error in the results but continue.
- Count errors in the stats.

## Terminal UI rendering

The terminal UI uses ANSI escape codes for colors and Unicode symbols for item types.

**Rendering a menu**:

```
╔═══════════════════════════════════════════════════╗
║  GOPHERMANCER - Graveyard Map                    ║
║  gopher://example.com:70/1/                      ║
╚═══════════════════════════════════════════════════╝

  i  Welcome to the gopherhole
  1  📁 Documents
  2  📁 Software
  3  📄 readme.txt
  4  💀 About this server (error)

Select an item (1-4) or 'q' to quit:
```

**Item type symbols**:
- `1` (directory): 📁 or `[DIR]`
- `0` (text file): 📄 or `[TXT]`
- `7` (search): 🔍 or `[SEARCH]`
- `9` (binary): 💾 or `[BIN]`
- `i` (info): no number, just the text
- `3` (error): 💀 or `[ERR]`

**Color scheme**:
- Background: black
- Text: green (for info and labels)
- Item numbers: bright white
- Errors: red
- Prompt: yellow

**Navigation**:
- The user enters a number to select an item.
- If the item is a directory (type 1), fetch and display the submenu.
- If the item is a text file (type 0), fetch and display the text.
- If the item is a search server (type 7), prompt for a query and submit it.
- If the item is any other type, display "Item type not supported for interactive browsing."

## Static HTML rendering

The static page generator produces a self-contained HTML file with embedded CSS.

**Structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gopherhole: {url}</title>
  <style>
    body { background-color: #0a0a0a; color: #33ff33; font-family: 'Courier New', monospace; }
    a { color: #ffaa00; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .info { color: #888; }
    .error { color: #ff3333; }
  </style>
</head>
<body>
  <h1>🪦 Gophermancer</h1>
  <p><strong>Location:</strong> {url}</p>
  <ul>
    <li>📁 <a href="gopher://...">Item 1</a></li>
    <li>📄 <a href="gopher://...">Item 2</a></li>
    <li class="info">ℹ️ Info line</li>
  </ul>
</body>
</html>
```

**Rendering logic**:
- Fetch the menu at the given URL.
- For each item:
  - If type `i`, render as `<li class="info">ℹ️ {display}</li>` (no link).
  - If type `3`, render as `<li class="error">💀 {display}</li>` (no link).
  - Otherwise, render as `<li>{symbol} <a href="{itemUrl}">{display}</a></li>`.

**Symbols** (same as terminal UI):
- `1`: 📁
- `0`: 📄
- `7`: 🔍
- `9`: 💾

**Note**: The links are `gopher://` URLs. A browser cannot follow them (no native Gopher support), but a judge can copy-paste the URL into the terminal UI or the MCP client.

## Error handling

### Network errors

Catch all network errors (DNS, connection refused, timeout) and return an error object:

```javascript
{
  error: true,
  message: 'Failed to connect to gopher.example.com:70: ECONNREFUSED',
  host: 'gopher.example.com',
  port: 70
}
```

### Protocol errors

If a menu line is malformed, log a warning to stderr and skip the line or include it with empty fields:

```javascript
console.warn('Malformed menu line (missing tabs):', line);
```

### URL parsing errors

If a URL does not start with `gopher://`, return an error:

```javascript
{
  error: true,
  message: 'Unsupported scheme: expected gopher://',
  url: 'http://example.com'
}
```

### Timeout

Set a socket timeout (default 10 seconds). If the server does not respond, close the socket and return a timeout error:

```javascript
socket.setTimeout(10000);
socket.on('timeout', () => {
  socket.destroy();
  reject(new Error('Timeout after 10 seconds'));
});
```

## Gopher server design

The Gopher server is used for testing and can also serve as a demo gopherhole.

**Responsibilities**:
- Listen on a given port (default 70, or a random port for tests).
- Accept TCP connections.
- Read the selector (one line ending in CRLF or LF).
- Look up the selector in a content map.
- Serve the response (menu, text, or binary).
- Close the connection.

**Content map**:

The server is initialized with a map of selectors to responses:

```javascript
{
  '/': {
    type: 'menu',
    items: [
      { type: 'i', display: 'Welcome to Gophermancer test server', selector: '', host: '', port: 0 },
      { type: '1', display: 'Documents', selector: '/docs', host: 'localhost', port: 70 },
      { type: '0', display: 'readme.txt', selector: '/readme.txt', host: 'localhost', port: 70 }
    ]
  },
  '/docs': {
    type: 'menu',
    items: [
      { type: '0', display: 'intro.txt', selector: '/docs/intro.txt', host: 'localhost', port: 70 }
    ]
  },
  '/readme.txt': {
    type: 'text',
    content: 'This is the readme.\nSecond line.\nThird line.'
  }
}
```

**Serving a menu**:
- For each item in `items`, format as `{type}{display}\t{selector}\t{host}\t{port}\r\n`.
- Send all lines and close the connection (no terminator for menus).

**Serving a text document**:
- Split `content` by `\n`.
- Send each line followed by `\r\n`.
- Send `.\r\n` and close the connection.

**Serving binary data**:
- Send the raw bytes and close the connection.

**Error handling**:
- If the selector is not found, send a type 3 error line and close the connection:
  ```
  3Selector not found	error	error.host	0\r\n
  ```
