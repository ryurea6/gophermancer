# Gopher Protocol Facts (RFC 1436)

This file documents the wire format and semantic details an implementer must not get wrong.

## Line endings

Gopher uses `\r\n` (CRLF, bytes 0x0D 0x0A) for all line endings. This is not negotiable. A bare `\n` (LF) is not compliant. Many historical servers tolerate LF-only, but clients and servers must send CRLF.

## Request format

```
<selector><CR><LF>
```

- `<selector>`: an opaque string (often a path, sometimes empty). No restrictions on characters except it cannot contain CRLF.
- A request for the root menu is typically an empty selector: just `\r\n` (two bytes).
- After sending the selector and CRLF, the client closes the write side of the connection (half-close) and reads the response until EOF.

## Response format: menu (item type 1)

A menu is a sequence of lines, each describing an item. Each line:

```
<item-type><display-string><TAB><selector><TAB><host><TAB><port><CR><LF>
```

- `<item-type>`: a single ASCII character indicating the item type (see below).
- `<display-string>`: human-readable text (no tabs or CRLF).
- `<TAB>`: literal tab character (0x09).
- `<selector>`: the selector string to send to `<host>:<port>` to retrieve this item.
- `<host>`: hostname or IP address.
- `<port>`: decimal port number as a string (usually "70").

The menu ends when the server closes the connection (EOF).

## Response format: text document (item type 0)

A text document is sent line-by-line, each line ending in CRLF. The last line is a single period:

```
.<CR><LF>
```

After sending this terminator, the server closes the connection.

**Important**: If a text document line begins with a period, it is **not** doubled. The single `.` line is the only terminator. (This differs from some other protocols like SMTP.)

## Response format: binary (item types 9, g, I, s, etc.)

Binary items are sent as raw bytes until EOF. No line structure, no terminator. The client reads until the server closes the connection.

## Item types

The first character of each menu line indicates the type:

| Type | Meaning               | Response format       |
|------|-----------------------|-----------------------|
| `0`  | Text file             | Text with `.` term    |
| `1`  | Directory (submenu)   | Menu (recursive)      |
| `2`  | CSO phone-book server | Not implemented       |
| `3`  | Error                 | Text message          |
| `4`  | BinHex Macintosh file | Binary                |
| `5`  | DOS binary archive    | Binary                |
| `6`  | UUEncoded file        | Binary                |
| `7`  | Index-Search server   | Menu (see below)      |
| `8`  | Telnet session        | Not a file transfer   |
| `9`  | Binary file           | Binary                |
| `+`  | Redundant server      | Mirror                |
| `T`  | Telnet 3270 session   | Not a file transfer   |
| `g`  | GIF image             | Binary                |
| `I`  | Image (other format)  | Binary                |
| `i`  | Info line (no link)   | Display only          |
| `h`  | HTML file             | Text or binary        |
| `s`  | Sound file            | Binary                |

**Special case: `i` (info line)**  
An info line has no functional link. The `<selector>`, `<host>`, and `<port>` fields are usually `fake` or `(NULL)` or `error.host` and port `0`. Clients display the text but do not make it clickable.

**Special case: `3` (error)**  
An error line indicates a problem. The `<display-string>` is the error message. The item is not navigable.

## Search servers (item type 7)

A type 7 item is an index-search server. The client appends a tab and the user's query to the selector:

```
<selector><TAB><query><CR><LF>
```

The server returns a menu (same format as type 1).

**Example**:  
Menu line: `7Search Veronica-2	/v2/vs	gopher.floodgap.com	70`  
User query: `gopher`  
Request sent: `/v2/vs\tgopher\r\n` to `gopher.floodgap.com:70`

## Default port

The default Gopher port is 70. If a menu line specifies a different port, the client must use it.

## Telnet items (types 8, T)

These indicate a Telnet session, not a file transfer. A Gopher client should spawn a Telnet client with the given host and port, not fetch data over Gopher.

## Server behavior

A Gopher server:
1. Listens on TCP port 70 (or a configured port).
2. Accepts a connection.
3. Reads one line (up to CRLF) as the selector.
4. Sends the response (menu, text, or binary).
5. Closes the connection.

One request, one response, one connection. No keep-alive, no pipelining.

## Client behavior

A Gopher client:
1. Opens a TCP connection to `<host>:<port>`.
2. Sends `<selector>\r\n`.
3. Reads the response until EOF.
4. Closes the connection.
5. Parses the response according to the item type requested.

## Robustness

- **Malformed lines**: If a menu line has too few tabs, treat missing fields as empty strings.
- **LF-only line endings**: Tolerate them on input (some servers are buggy), but always send CRLF on output.
- **Long lines**: No RFC-mandated line length limit. Implementations should handle at least 1024 bytes per line.
- **Selectors with special characters**: Selectors are opaque. Do not URL-encode them. Send them verbatim (but escape CRLF if present, which should never happen).

## Security

- **No authentication**: Gopher has no user authentication or access control.
- **No encryption**: All data is plaintext.
- **Arbitrary selectors**: A malicious menu can specify any host and port. Clients should warn users before connecting to non-standard ports or non-Gopher services.

For Gophermancer, we implement type 0, 1, 7, 9, i, and 3. Other types are recognized but not specially handled (displayed as "unsupported type").
