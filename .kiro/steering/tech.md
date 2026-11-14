# Gophermancer Technical Steering

## Stack

- **Runtime**: Node.js 22+ only. No Deno, no Bun, no browser.
- **Language**: JavaScript with JSDoc type annotations. No TypeScript compiler.
- **Standard library only**: `node:net`, `node:fs`, `node:path`, `node:readline`, `node:test`, `node:assert`. No npm runtime dependencies.
- **Dev dependencies allowed**: Test coverage reporters, linters, formatters. Nothing that runs in production.

## Module layout

```
src/
  gopher/
    client.js        # Gopher protocol client (connect, request, parse response)
    server.js        # Gopher protocol server (listen, serve menu/text/binary)
    codec.js         # Wire format: encode/decode with CRLF line endings
    parser.js        # Menu parser: item type + display + selector + host + port
  mcp/
    server.js        # MCP server implementation (stdio transport)
    tools.js         # Tool schemas and handlers (browse, fetch, search, spelunk)
  ui/
    terminal.js      # Terminal UI: graveyard map renderer
    static.js        # Static HTML generator
  crawl/
    spelunker.js     # Crawl algorithm: follow links, respect limits, return map
test/
  gopher/
    *.test.js        # Unit tests for Gopher client, server, codec, parser
  mcp/
    *.test.js        # Integration tests for MCP tools
  ui/
    *.test.js        # Rendering tests
  crawl/
    *.test.js        # Crawl algorithm tests with in-process Gopher server
```

## Naming conventions

- **Files**: lowercase with hyphens for multi-word names (e.g., `gopher-client.js`). Exception: single-word module names use no hyphens (e.g., `codec.js`).
- **Functions**: camelCase. Exported functions are the public API.
- **Constants**: SCREAMING_SNAKE_CASE for protocol constants (e.g., `ITEM_TYPE_DIRECTORY`).
- **Tests**: `*.test.js` files, one per source file. Test function names describe the behavior under test.

## Testing conventions

- Use Node.js built-in test runner (`node:test`) and assertions (`node:assert/strict`).
- Run with `node --test test/**/*.test.js`.
- No network access in tests. Spawn an in-process Gopher server using `node:net` on a random available port.
- Each test file is self-contained: it imports what it tests and any fixtures it needs.
- Mock external dependencies at module boundaries (e.g., mock `node:net` socket for codec tests).

## No third-party runtime dependencies rule

**Rationale**:
1. Gopher is a simple protocol (RFC 1436 is 11 pages). A correct implementation fits in a few hundred lines.
2. MCP stdio transport uses JSON-RPC over stdin/stdout. Node.js provides `readline` and `JSON.parse`.
3. The terminal UI only needs ANSI escape codes, which are strings.
4. Judges should be able to clone, run `node src/mcp/server.js`, and see it work without `npm install`.
5. Demonstrates mastery of fundamentals: sockets, protocol parsing, and wire formats.

**Exceptions**:
- Dev dependencies for linting, formatting, or coverage reporting are fine (they don't run in production).
- If a judge uses an MCP client that requires a package.json, we include one, but `dependencies: {}` is empty.

## Build and run

No build step. Run source files directly:
- MCP server: `node src/mcp/server.js`
- Terminal UI: `node src/ui/terminal.js <gopher-url>`
- Static page generator: `node src/ui/static.js <gopher-url> > output.html`
- Tests: `node --test test/**/*.test.js`

## Error handling

- Network errors (DNS, connection refused, timeout) return descriptive error messages to the caller.
- Protocol errors (malformed menu, unexpected line endings) log a warning and attempt to continue or return a partial result.
- MCP tool errors follow the JSON-RPC error response format.
- The terminal UI and static page renderer handle missing or malformed data gracefully (show "unavailable" instead of crashing).
