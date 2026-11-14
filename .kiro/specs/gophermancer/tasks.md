# Gophermancer Implementation Tasks

Tasks are grouped into phases. Each task is small enough to complete and verify independently.

## Phase 1: Gopher Wire Protocol

- [x] **T1.1**: Write `src/gopher/codec.js` with `encodeRequest(selector)` and `decodeLines(buffer)` functions. Enforce CRLF in encoding. Accept CRLF or LF in decoding.
- [x] **T1.2**: Write tests for codec in `test/gopher/codec.test.js`. Verify CRLF encoding, LF tolerance, and empty selector handling.
- [x] **T1.3**: Write `src/gopher/parser.js` with `parseMenu(lines)` function. Extract type, display, selector, host, port from tab-separated lines.
- [x] **T1.4**: Write tests for menu parser in `test/gopher/parser.test.js`. Test valid menu, malformed lines (missing tabs), and empty lines.
- [x] **T1.5**: Add `parseText(lines)` to `parser.js`. Stop at the `.` terminator. Do not treat other lines starting with `.` as terminators.
- [x] **T1.6**: Write tests for text parser in `test/gopher/parser.test.js`. Test terminator handling and lines starting with `.profile` or similar.

## Phase 2: Gopher Client

- [x] **T2.1**: Write `src/gopher/client.js` with `fetch(host, port, selector)` function. Use `node:net` to connect, send encoded request, read response until EOF, return raw buffer.
- [x] **T2.2**: Write tests for client in `test/gopher/client.test.js`. Test successful fetch (requires in-process server).
- [x] **T2.3**: Add timeout handling to `client.js`. Default 10 seconds. If timeout, destroy socket and reject with error.
- [x] **T2.4**: Add error handling to `client.js`. Catch DNS, connection refused, and other errors. Return descriptive error messages.
- [x] **T2.5**: Write tests for client error handling. Test connection refused (port 1), timeout (mock slow server), and invalid hostname.
- [x] **T2.6**: Add `parseUrl(gopherUrl)` helper to `client.js`. Parse `gopher://host:port/typeSelector` into `{ host, port, itemType, selector }`. Default port 70, default type 1.
- [x] **T2.7**: Write tests for URL parsing. Test valid URLs, missing port, missing type, and invalid schemes.

## Phase 3: Gopher Server

- [x] **T3.1**: Write `src/gopher/server.js` with `createServer(contentMap, port)` function. Listen on the given port, accept connections, read selector, serve response, close connection.
- [x] **T3.2**: Implement menu serving in `server.js`. Format each item as `{type}{display}\t{selector}\t{host}\t{port}\r\n` and send.
- [x] **T3.3**: Implement text serving in `server.js`. Send each line with `\r\n`, then send `.\r\n` terminator.
- [x] **T3.4**: Implement binary serving in `server.js`. Send raw bytes, no terminator.
- [x] **T3.5**: Implement error serving in `server.js`. If selector not found, send type 3 error line.
- [x] **T3.6**: Write tests for server in `test/gopher/server.test.js`. Start server on random port, connect with raw socket, request menu, verify response.
- [x] **T3.7**: Write tests for text serving. Request a text selector, verify terminator is present and correct.
- [x] **T3.8**: Write tests for error handling. Request nonexistent selector, verify type 3 error response.

## Phase 4: MCP Server Foundation

- [ ] **T4.1**: Write `src/mcp/server.js` with JSON-RPC stdio transport. Read from stdin line-by-line, parse JSON-RPC requests, dispatch to handlers, write JSON-RPC responses to stdout.
- [ ] **T4.2**: Implement `initialize` and `tools/list` handlers. Return tool schemas for `gopher_browse`, `gopher_fetch`, `gopher_search`, `gopher_spelunk`.
- [ ] **T4.3**: Write a manual test: run `node src/mcp/server.js`, send `{"jsonrpc":"2.0","method":"tools/list","id":1}` on stdin, verify the response includes all four tools.
- [ ] **T4.4**: Implement JSON-RPC error handling. If a request is malformed or a method is not found, return a JSON-RPC error response.

## Phase 5: MCP Tools

- [ ] **T5.1**: Write `src/mcp/tools.js` with `gopherBrowse(url)` function. Parse URL, fetch menu, parse menu, return array of items.
- [ ] **T5.2**: Integrate `gopherBrowse` into MCP server. Handle `tools/call` for `gopher_browse`.
- [ ] **T5.3**: Write tests for `gopherBrowse` in `test/mcp/tools.test.js`. Start in-process Gopher server, call `gopherBrowse`, verify returned items.
- [ ] **T5.4**: Write `gopherFetch(url)` in `tools.js`. Fetch text document, parse text, return string (without terminator).
- [ ] **T5.5**: Integrate `gopherFetch` into MCP server. Write tests.
- [ ] **T5.6**: Write `gopherSearch(url, query)` in `tools.js`. Append `\t{query}` to selector, fetch menu, return items.
- [ ] **T5.7**: Integrate `gopherSearch` into MCP server. Write tests.
- [ ] **T5.8**: Handle tool errors in `tools.js`. If fetch fails, return error object with descriptive message. MCP server wraps it in JSON-RPC error.

## Phase 6: Spelunker

- [ ] **T6.1**: Write `src/crawl/spelunker.js` with `spelunk(startUrl, maxDepth, maxVisits)` function. Initialize queue with `{ url, depth: 0 }`, visited set, results array.
- [ ] **T6.2**: Implement BFS loop. Dequeue, check visited, fetch item, record result, enqueue children if depth < maxDepth.
- [ ] **T6.3**: Implement visit limit. Stop when `visited.size >= maxVisits`.
- [ ] **T6.4**: Implement cycle detection. Do not visit a URL twice.
- [ ] **T6.5**: Record outbound links for each visited item (all menu items, not just directories).
- [ ] **T6.6**: Return `SpelunkResult` with `visited` array and `stats` object.
- [ ] **T6.7**: Write tests for spelunker in `test/crawl/spelunker.test.js`. Build a test gopherhole with directories and subdirectories, crawl with depth 1, verify only one level is visited.
- [ ] **T6.8**: Write tests for visit limit. Crawl with limit 3, verify only 3 URLs are visited.
- [ ] **T6.9**: Write tests for cycle detection. Build a gopherhole with circular link (A -> B -> A), crawl, verify each URL visited once.
- [ ] **T6.10**: Integrate spelunker into MCP server. Implement `gopher_spelunk` tool, write tests.

## Phase 7: Terminal UI

- [ ] **T7.1**: Write `src/ui/terminal.js` with a main loop. Accept a Gopher URL as a command-line argument. Fetch and display the menu.
- [ ] **T7.2**: Implement menu rendering with ANSI colors and Unicode symbols. Display item numbers for selectable items, no number for type `i`.
- [ ] **T7.3**: Implement user input. Use `node:readline` to prompt for item number. Fetch and display selected item.
- [ ] **T7.4**: Handle directory navigation. If selected item is type 1, fetch submenu and display.
- [ ] **T7.5**: Handle text display. If selected item is type 0, fetch text and display line-by-line.
- [ ] **T7.6**: Handle search. If selected item is type 7, prompt for query, submit, display results.
- [ ] **T7.7**: Handle errors gracefully. If fetch fails, display error message and return to menu.
- [ ] **T7.8**: Implement quit command. If user enters `q`, exit.
- [ ] **T7.9**: Manual test: run `node src/ui/terminal.js gopher://localhost:7070/1/`, verify menu displays, navigate to a submenu, fetch a text file.

## Phase 8: Static HTML Generator

- [ ] **T8.1**: Write `src/ui/static.js` with `generateHtml(url)` function. Fetch menu, render as HTML with embedded CSS.
- [ ] **T8.2**: Implement CSS necromancer theme: dark background, green text, amber links, gothic font.
- [ ] **T8.3**: Render menu items as list. Type `i` and type `3` have no link, others are anchor tags with `href="gopher://..."`.
- [ ] **T8.4**: Add Unicode symbols for item types (same as terminal UI).
- [ ] **T8.5**: Handle errors. If fetch fails, generate HTML with error message.
- [ ] **T8.6**: Write main CLI. Accept URL as command-line argument, call `generateHtml(url)`, write to stdout.
- [ ] **T8.7**: Write tests for static generator in `test/ui/static.test.js`. Generate HTML, verify it is valid HTML, verify CSS is present, verify links are correct.
- [ ] **T8.8**: Manual test: run `node src/ui/static.js gopher://localhost:7070/1/ > out.html`, open in browser, verify appearance and links.

## Phase 9: Integration and Polish

- [ ] **T9.1**: Create `package.json` with metadata (name, version, description, author, license). Leave `dependencies: {}` empty. Add `scripts` for running tests.
- [ ] **T9.2**: Write `README.md` with installation instructions, usage examples for MCP server, terminal UI, and static generator.
- [ ] **T9.3**: Run all tests with `node --test test/**/*.test.js`. Verify all pass.
- [ ] **T9.4**: Write a demo gopherhole content map. Include directories, text files, info lines, and a search server stub.
- [ ] **T9.5**: Update terminal UI to use demo gopherhole by default (if no URL provided).
- [ ] **T9.6**: Update static generator to use demo gopherhole by default.
- [ ] **T9.7**: Manual end-to-end test: start MCP server, use an MCP client (e.g., Claude Desktop) to call `gopher_browse`, verify response.
- [ ] **T9.8**: Manual end-to-end test: run terminal UI, navigate through demo gopherhole, verify rendering and navigation.
- [ ] **T9.9**: Manual end-to-end test: generate HTML for demo gopherhole, open in browser, verify appearance.
- [ ] **T9.10**: Review all code for CRLF correctness. Ensure all outgoing requests and responses use `\r\n`.

## Phase 10: Documentation and Submission Prep

- [ ] **T10.1**: Write `HACKATHON.md` describing what Gophermancer is, why it fits the Frankenstein category, and how to demo it.
- [ ] **T10.2**: Verify `.kiro` directory is not gitignored. Check `.gitignore` file.
- [ ] **T10.3**: Take screenshots of terminal UI and static HTML page. Save in `docs/screenshots/`.
- [ ] **T10.4**: Record a short video demo (optional but recommended). Show MCP server responding to a tool call, terminal UI navigation, and HTML page in browser.
- [ ] **T10.5**: Review all specs, hooks, and steering files. Ensure they are readable and demonstrate real Kiro usage.
- [ ] **T10.6**: Final commit and push to repository.
