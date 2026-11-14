# Gophermancer Requirements

Each requirement has a unique ID and testable acceptance criteria.

## Gopher Protocol (Client)

**R1: Gopher client connects and retrieves a menu**  
Acceptance:
- Given a hostname, port, and selector, the client opens a TCP connection.
- The client sends `<selector>\r\n` and reads until EOF.
- The client returns the raw response bytes.
- Test: connect to an in-process Gopher server, request `/`, verify the response matches the expected menu string.

**R2: Gopher client handles connection errors**  
Acceptance:
- Given an invalid hostname, the client returns an error with the DNS failure message.
- Given a closed port, the client returns an error indicating connection refused.
- Given a timeout (no response), the client returns an error after a configurable timeout (default 10 seconds).
- Test: attempt to connect to `localhost:1` (refused), verify error message contains "refused" or "ECONNREFUSED".

**R3: Gopher client enforces CRLF line endings in requests**  
Acceptance:
- All requests sent by the client end with `\r\n` (bytes 0x0D 0x0A).
- Test: capture the bytes sent to the socket, verify the last two bytes are 0x0D 0x0A.

## Gopher Protocol (Parser)

**R4: Menu parser extracts item type, display, selector, host, and port**  
Acceptance:
- Given a menu response, the parser returns an array of items, each with `{ type, display, selector, host, port }`.
- Test: parse a menu with three lines (type 0, type 1, type i), verify each field is extracted correctly.

**R5: Menu parser tolerates malformed lines**  
Acceptance:
- Given a line with fewer than four tabs, the parser treats missing fields as empty strings.
- Given a line with no tabs, the parser extracts only the display string and leaves other fields empty.
- Test: parse a menu with `i	Info text\r\n` (one tab, missing selector/host/port), verify `selector`, `host`, and `port` are empty strings.

**R6: Menu parser handles LF-only line endings**  
Acceptance:
- Given a menu with `\n` instead of `\r\n`, the parser extracts items correctly.
- Test: parse `0File\tfile.txt\thost\t70\n`, verify the item is extracted.

**R7: Text document parser stops at the terminator**  
Acceptance:
- Given a text response ending with `.\r\n`, the parser returns lines up to but not including the terminator.
- Test: parse `Line 1\r\nLine 2\r\n.\r\n`, verify the result is `["Line 1", "Line 2"]`.

**R8: Text document parser does not treat other periods as terminators**  
Acceptance:
- Given a line that begins with a period but has additional text, the parser includes it.
- Test: parse `Line 1\r\n.profile\r\n.\r\n`, verify the result includes `.profile`.

## Gopher Protocol (Server)

**R9: Gopher server listens and serves a menu**  
Acceptance:
- The server listens on a given port.
- When a client connects and sends a selector, the server sends a menu response and closes the connection.
- Test: start the server, connect with a raw TCP socket, send `/\r\n`, verify the response is a valid menu.

**R10: Gopher server serves text documents with terminator**  
Acceptance:
- When the server sends a text document, it appends `.\r\n` after the last line.
- Test: request a text item, verify the response ends with `\r\n.\r\n`.

**R11: Gopher server serves binary data**  
Acceptance:
- When the server sends a binary item, it sends raw bytes until EOF with no terminator.
- Test: request a binary item (type 9), verify the bytes match the expected binary data and there is no `.\r\n` at the end.

## MCP Server

**R12: MCP server starts and announces tools**  
Acceptance:
- When started, the server sends a `tools/list` response with `gopher_browse`, `gopher_fetch`, `gopher_search`, and `gopher_spelunk`.
- Test: send `{"jsonrpc":"2.0","method":"tools/list","id":1}`, verify the response includes all four tools.

**R13: `gopher_browse` tool returns a parsed menu**  
Acceptance:
- Given `{ "url": "gopher://host:port/1/path" }`, the tool returns a JSON array of menu items.
- Test: call `gopher_browse` with a URL pointing to the in-process Gopher server, verify the returned items match the expected menu structure.

**R14: `gopher_fetch` tool returns text content**  
Acceptance:
- Given `{ "url": "gopher://host:port/0/file.txt" }`, the tool returns the text content as a string (without the `.\r\n` terminator).
- Test: call `gopher_fetch` with a type 0 URL, verify the content matches the expected text.

**R15: `gopher_search` tool submits a query**  
Acceptance:
- Given `{ "url": "gopher://host:port/7/search", "query": "test" }`, the tool sends `<selector>\t<query>\r\n` and returns the menu results.
- Test: call `gopher_search` with a type 7 URL and query "test", verify the request sent is `/search\ttest\r\n` and the response is parsed as a menu.

**R16: `gopher_spelunk` tool crawls a gopherhole**  
Acceptance:
- Given a starting URL and depth limit, the tool follows type 1 links recursively and returns a map of discovered items.
- The map includes each URL visited, its type, and its children (outbound links).
- Test: call `gopher_spelunk` with a root URL and depth 2, verify the result includes the root menu and one level of submenus, but does not recurse beyond depth 2.

**R17: MCP server handles tool errors**  
Acceptance:
- If a tool call fails (network error, invalid URL), the server returns a JSON-RPC error response with a descriptive message.
- Test: call `gopher_fetch` with `gopher://invalid.test:70/0/file`, verify the response is `{"jsonrpc":"2.0","error":{...},"id":...}` and the error message mentions the failure.

## Terminal UI

**R18: Terminal UI renders a menu as a graveyard map**  
Acceptance:
- Given a Gopher URL, the terminal UI fetches the menu and displays each item with a visual marker (e.g., tombstone for directories, scroll for text, skull for errors).
- The user can navigate by selecting an item number.
- Test: run the terminal UI with a test URL, capture stdout, verify it includes the item display strings and visual markers.

**R19: Terminal UI follows directory links**  
Acceptance:
- When the user selects a type 1 item, the UI fetches the submenu and displays it.
- Test: simulate user input selecting a directory item, verify the UI fetches the new menu.

**R20: Terminal UI fetches and displays text documents**  
Acceptance:
- When the user selects a type 0 item, the UI fetches the text and displays it line-by-line.
- Test: simulate user input selecting a text item, verify the UI displays the content.

**R21: Terminal UI displays info lines without making them selectable**  
Acceptance:
- Type `i` items are displayed as text with no item number.
- Test: display a menu with an `i` line, verify it is shown but not numbered.

## Static HTML Generator

**R22: Static HTML generator renders a menu as HTML**  
Acceptance:
- Given a Gopher URL, the generator fetches the menu and outputs HTML with links for each navigable item.
- Type `i` items are rendered as plain text (no link).
- Test: generate HTML for a test URL, verify the output is valid HTML and contains anchor tags with `href="gopher://..."` for type 0 and type 1 items.

**R23: Static HTML generator applies a necromancer theme**  
Acceptance:
- The HTML includes CSS styles with a dark background, green or amber text, and gothic fonts.
- Visual markers (Unicode symbols or emoji) distinguish item types.
- Test: generate HTML, verify `<style>` tag is present and includes `background-color` and `color` rules.

**R24: Static HTML generator handles fetch errors gracefully**  
Acceptance:
- If the URL is unreachable, the generator outputs an HTML page with an error message instead of crashing.
- Test: generate HTML for an invalid URL, verify the output is valid HTML containing "error" or "unavailable".

## Crawl Algorithm

**R25: Spelunker respects depth limit**  
Acceptance:
- Given a depth limit, the crawler does not follow links beyond that depth.
- Depth 0: only the starting URL. Depth 1: starting URL plus one level of links. Depth 2: two levels, etc.
- Test: crawl a gopherhole with depth 1, verify the result includes the root and its direct children, but not grandchildren.

**R26: Spelunker respects visit limit**  
Acceptance:
- Given a maximum visit count, the crawler stops after visiting that many URLs.
- Test: crawl a gopherhole with a visit limit of 5, verify the result includes at most 5 URLs.

**R27: Spelunker avoids infinite loops**  
Acceptance:
- If a menu links back to itself or to a previously visited URL, the crawler does not fetch it again.
- Test: construct a menu with a circular link (A -> B -> A), crawl it, verify each URL is visited only once.

**R28: Spelunker records item metadata**  
Acceptance:
- For each visited URL, the crawler records the item type, display string, and list of outbound links.
- Test: crawl a gopherhole, verify the result includes `{ url, type, display, links: [...] }` for each item.

## Error Handling

**R29: Network errors are reported with context**  
Acceptance:
- DNS failures, connection refused, and timeouts include the target host and port in the error message.
- Test: attempt to fetch `gopher://nonexistent.test:70/`, verify the error message includes "nonexistent.test".

**R30: Protocol errors are logged and handled gracefully**  
Acceptance:
- If a menu line is malformed, the parser logs a warning and includes a partial item or skips the line.
- Test: parse a menu with a line containing no tabs, verify the parser does not throw and logs a warning.

**R31: Invalid URLs return descriptive errors**  
Acceptance:
- If a URL has no scheme, an unsupported scheme, or a malformed host, the client returns an error explaining what is wrong.
- Test: call `gopher_fetch` with `http://example.com`, verify the error message says "unsupported scheme" or "expected gopher://".

## Cross-cutting

**R32: All code paths tested**  
Acceptance:
- Every exported function has at least one test.
- Tests run deterministically without network access.
- Test: run `node --test test/**/*.test.js`, verify all tests pass.

**R33: No third-party runtime dependencies**  
Acceptance:
- `package.json` (if present) has `"dependencies": {}` (empty object).
- All `require()` or `import` statements reference `node:*` built-in modules or local files.
- Test: grep the source for `require(` and `import`, verify no npm package names appear.

**R34: Code runs on Node.js 22+**  
Acceptance:
- The code uses only features available in Node.js 22 (e.g., `node:test`, `node:readline/promises`).
- Test: run all tests and the MCP server on Node.js 22, verify no errors.
