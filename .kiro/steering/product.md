# Gophermancer Product Brief

## What it is

Gophermancer resurrects Gopherspace for AI agents. It is a working bridge between the 1991 Gopher protocol (RFC 1436) and the 2024 Model Context Protocol (MCP). An agent using MCP tools can browse, search, and crawl live gopherholes. A human can drive the same code through a terminal UI or a static web page.

## Who it is for

1. **Hackathon judges** evaluating Frankenstein category entries (stitching incompatible technologies).
2. **AI agent developers** who want to demonstrate protocol flexibility and retro-internet access.
3. **Gopher enthusiasts** who want to see their protocol made accessible to modern tools.

## What done means

Done is:
- A real Gopher client and server that speak RFC 1436 wire format correctly.
- MCP tools (`gopher_browse`, `gopher_fetch`, `gopher_search`, `gopher_spelunk`) that work with any MCP-compatible agent.
- A terminal UI that renders gopherholes as a graveyard map (necromancer theme).
- A static HTML page that renders the same data without requiring a terminal.
- A test suite that runs deterministically without network access (using an in-process Gopher server).
- A `.kiro` directory showing real Kiro usage: specs, hooks, and steering files.

Not done until all five parts work and a judge can try both the terminal UI and the HTML page.

## Hackathon constraints

- **Category**: Frankenstein — incompatible technologies stitched together.
- **Required**: A `.kiro` directory at the root, not gitignored, with specs, hooks, and steering that demonstrate real Kiro usage.
- **Deadline**: Fixed submission window; scope must fit.
- **Demo requirement**: Judges must be able to run it and see results without extensive setup.

## Non-goals

- General-purpose Gopher browser features (bookmarks, history, search indexing).
- Gopher+ protocol extensions (we implement only RFC 1436).
- Integration with every MCP client (we target the MCP specification, not specific clients).
- Production-ready hardening (this is a hackathon proof-of-concept).
