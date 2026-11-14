# 💀 Gophermancer

**Resurrecting Gopherspace for AI Agents**

Gophermancer bridges the 1991 Gopher protocol (RFC 1436) with the 2024 Model Context Protocol (MCP). A necromantic feat of stitching incompatible technologies together.

## What It Is

A working implementation of:
- **Gopher client and server** (RFC 1436 compliant wire format)
- **MCP tools** for AI agents to browse, fetch, search, and crawl gopherholes
- **Terminal UI** with a necromancer theme for human explorers
- **Static HTML generator** for preserving gopherspace as self-contained pages

All built with Node.js standard library only. No runtime dependencies. Pure protocol necromancy.

## Quick Start

### Prerequisites

- Node.js 22+ 
- Nothing else (zero npm dependencies)

### Installation

```bash
git clone <repository-url>
cd gophermancer
```

That's it. No `npm install` needed.

### Run the Tests

```bash
npm test
```

All 74+ tests should pass, exercising the full stack without touching the network.

## Three Ways to Use Gophermancer

### 1. MCP Server (for AI Agents)

Start the MCP server:

```bash
node src/mcp/server.js
```

The server communicates via JSON-RPC over stdin/stdout. It provides four tools:

- `gopher_browse(url)` - Browse a menu
- `gopher_fetch(url)` - Fetch a text document  
- `gopher_search(url, query)` - Search a gopherhole
- `gopher_spelunk(url, maxDepth, maxVisits)` - Crawl recursively

**MCP Client Configuration:**

Add this to your MCP client's config (e.g., Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gophermancer": {
      "command": "node",
      "args": ["/absolute/path/to/gophermancer/src/mcp/server.js"],
      "env": {}
    }
  }
}
```

Replace `/absolute/path/to/gophermancer` with the actual path.

### 2. Terminal UI (for Humans)

Browse gopherspace in your terminal:

```bash
node src/ui/terminal.js gopher://gopher.floodgap.com/1/
```

**Features:**
- Necromancer-themed ANSI colors and Unicode symbols
- Navigate menus with numbered selections
- View text documents
- Search gopherholes (type 7 items)
- Back navigation and history
- Graceful error handling

**Controls:**
- Type a number to select an item
- `b` or `back` to go back
- `q` or `quit` to exit

**Try the demo server:**

```bash
# Terminal 1: Start demo server
node demo/server.js

# Terminal 2: Browse it
node src/ui/terminal.js gopher://localhost:7070/1/
```

### 3. Static HTML Generator

Render a gopherhole as a self-contained HTML page:

```bash
node src/ui/static.js gopher://gopher.floodgap.com/1/ > output.html
```

The generated HTML:
- Contains all CSS inline (no external dependencies)
- Preserves the necromancer theme
- Works offline once saved
- Links to other gopher URLs (for further exploration)

**Generate from the demo:**

```bash
# Terminal 1: Start demo server
node demo/server.js

# Terminal 2: Generate HTML
node src/ui/static.js gopher://localhost:7070/1/ > demo.html
open demo.html  # or xdg-open on Linux
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACES                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐ │
│  │ Terminal │    │  Static  │    │    MCP Client    │ │
│  │    UI    │    │   HTML   │    │   (AI Agent)     │ │
│  └─────┬────┘    └─────┬────┘    └────────┬─────────┘ │
└────────┼───────────────┼──────────────────┼───────────┘
         │               │                  │
         └───────────────┴──────────────────┘
                         ↓
         ┌───────────────────────────────┐
         │        MCP TOOLS LAYER        │
         │  • gopher_browse()            │
         │  • gopher_fetch()             │
         │  • gopher_search()            │
         │  • gopher_spelunk()           │
         └───────────────┬───────────────┘
                         ↓
         ┌───────────────────────────────┐
         │    GOPHER PROTOCOL LAYER      │
         │  • Client (fetch + parse URL) │
         │  • Parser (menu + text)       │
         │  • Codec (CRLF encoding)      │
         │  • Server (for testing/demo)  │
         └───────────────┬───────────────┘
                         ↓
         ┌───────────────────────────────┐
         │         TCP SOCKETS           │
         │      (node:net module)        │
         └───────────────────────────────┘
                         ↓
         ┌───────────────────────────────┐
         │         GOPHERSPACE           │
         │  (Live servers still exist!)  │
         │  • gopher.floodgap.com        │
         │  • gopherpedia.com            │
         │  • ... and more ...           │
         └───────────────────────────────┘
```

**Design Principles:**
1. **Standard library only** - No runtime dependencies to install
2. **RFC 1436 compliant** - CRLF line endings, correct wire format
3. **Tested without network** - In-process test servers
4. **Three surfaces** - MCP tools, terminal UI, static HTML
5. **Necromancer theme** - Because raising the dead should look cool

## Demo Gopherhole

Gophermancer includes a themed demo gopherhole under `demo/`:

**Content:**
- Root menu with directories, texts, and search
- Library submenu with documentation
- Spell components (protocol details)
- Restricted section (forbidden knowledge)
- Working search server
- Necromancer theme throughout

**Start it:**

```bash
node demo/server.js
# Or specify a port:
node demo/server.js 8080
```

Then browse with:
- Terminal: `node src/ui/terminal.js gopher://localhost:7070/1/`
- Static HTML: `node src/ui/static.js gopher://localhost:7070/1/ > demo.html`
- MCP tools: Call `gopher_browse` with `gopher://localhost:7070/1/`

## Kiroween Hackathon - Frankenstein Category

**Category:** Frankenstein (stitching incompatible technologies together)

**The Stitch:**
- **1991 Technology:** Gopher protocol (RFC 1436)
  - Text-based, hierarchical menus
  - TCP sockets with CRLF line endings
  - Tab-separated fields
  - Single-period terminator for text documents
  - One request, one response, close connection
  
- **2024 Technology:** Model Context Protocol (MCP)
  - JSON-RPC over stdio
  - Structured tool schemas
  - AI agent integration
  - Asynchronous, persistent connections

**Why They're Incompatible:**
- Gopher predates JSON (1991 vs 2002)
- Gopher is synchronous request/response; MCP is async message-passing
- Gopher has no concept of AI agents or structured data
- Line ending differences (CRLF vs LF)
- Gopher is dead; MCP is brand new

**The Bridge:**
- Gopher client speaks native wire protocol
- MCP tools present structured, modern interface
- Parser translates tab-separated menus to JSON objects
- Agent sees clean, documented tools; protocol details hidden
- The necromancer (our code) makes the translation

**Demonstration of Kiro Usage:**

This project's `.kiro/` directory contains:
- `specs/gophermancer/` - Complete specification and task breakdown
- `specs/gophermancer/tasks.md` - 80+ tasks across 10 phases
- Real specs that guided the implementation
- Demonstrates task management, phased development, and spec-first design

## File Structure

```
gophermancer/
├── .kiro/
│   └── specs/
│       └── gophermancer/
│           ├── tasks.md          # Implementation task list
│           └── ...               # Other specs
├── src/
│   ├── gopher/
│   │   ├── client.js             # Protocol client + URL parsing
│   │   ├── server.js             # Protocol server (for tests/demo)
│   │   ├── codec.js              # Wire format encoding/decoding
│   │   └── parser.js             # Menu and text parsing
│   ├── mcp/
│   │   ├── server.js             # JSON-RPC stdio transport
│   │   └── tools.js              # Tool implementations
│   ├── crawl/
│   │   └── spelunker.js          # Recursive crawl algorithm
│   └── ui/
│       ├── terminal.js           # Terminal UI with ANSI colors
│       └── static.js             # Static HTML generator
├── test/
│   ├── gopher/                   # Protocol layer tests
│   ├── mcp/                      # MCP tool tests
│   ├── crawl/                    # Spelunker tests
│   ├── ui/                       # UI tests
│   └── e2e/                      # End-to-end tests
├── demo/
│   ├── content.js                # Demo gopherhole content
│   └── server.js                 # Demo server script
├── package.json                  # Project metadata (zero dependencies)
└── README.md                     # This file
```

## Technical Details

**Language:** JavaScript (Node.js 22+)  
**Module System:** ES modules (`"type": "module"`)  
**Dependencies:** Zero runtime dependencies (standard library only)  
**Line Count:** ~2,500 lines of implementation + tests  
**Test Suite:** 74+ tests, all passing, no network access  

**Supported Gopher Item Types:**
- `0` - Text file
- `1` - Directory (menu)
- `3` - Error
- `7` - Search server
- `9` - Binary file
- `g` - GIF image
- `I` - Image (other formats)
- `h` - HTML file
- `i` - Informational text (no link)
- `s` - Sound file

**Not Supported:**
- Gopher+ extensions
- Telnet items (type 8, T)
- Interactive forms
- Real-time streaming

**Protocol Correctness:**
- CRLF (`\r\n`) line endings in all outgoing data
- Accepts both CRLF and LF on input (tolerant)
- Tab-separated fields in menus
- Single-period terminator for text documents
- Proper selector encoding (including empty root selector)
- Timeout and error handling

## Real Gopherholes to Try

Once you have Gophermancer running, explore these live gopherholes:

- `gopher://gopher.floodgap.com/1/` - The OG Gopher server
- `gopher://gopherpedia.com/1/` - Wikipedia via Gopher
- `gopher://bitreich.org/1/` - Bitreich community
- `gopher://gopherproject.org/1/` - Gopher Project

**Example:**

```bash
node src/ui/terminal.js gopher://gopher.floodgap.com/1/
```

## License

MIT License - See package.json for details

## Credits

Built for the Kiroween 2024 Hackathon (Frankenstein Category)

**Technologies Stitched:**
- RFC 1436 (Gopher Protocol) - 1991
- Model Context Protocol (MCP) - 2024
- Node.js standard library
- ANSI escape codes (terminal colors)
- HTML5 + CSS3 (static rendering)

**Inspirations:**
- The Gopher protocol maintainers who keep servers running
- Anthropic's Model Context Protocol specification
- Every necromancer who refuses to let old technology die
- The Frankenstein spirit of stitching incompatible parts together

---

💀 **"Some protocols should not be forgotten. We are the memory."** 💀
