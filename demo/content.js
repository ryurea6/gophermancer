/**
 * Demo Gopherhole Content Map
 * A necromancer-themed demo site for Gophermancer
 */

export const demoContent = {
  // Root menu
  '': {
    type: 'menu',
    items: [
      { type: 'i', display: '═══════════════════════════════════════════════════════════', selector: '', host: '', port: 0 },
      { type: 'i', display: '💀  WELCOME TO THE GOPHERMANCER CRYPT  💀', selector: '', host: '', port: 0 },
      { type: 'i', display: '═══════════════════════════════════════════════════════════', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: 'i', display: 'Where ancient protocols rise from their digital graves...', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: '1', display: '🏰  The Necromancer\'s Library', selector: '/library', host: 'localhost', port: 7070 },
      { type: '1', display: '⚗️   Spell Components', selector: '/spells', host: 'localhost', port: 7070 },
      { type: '7', display: '🔮  Scrying Pool (Search)', selector: '/search', host: 'localhost', port: 7070 },
      { type: '0', display: '📜  The Ancient Manifesto', selector: '/manifesto.txt', host: 'localhost', port: 7070 },
      { type: '0', display: '⚰️   Gopher Protocol Burial Records (RFC 1436)', selector: '/rfc1436.txt', host: 'localhost', port: 7070 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: 'i', display: '───────────────────────────────────────────────────────────', selector: '', host: '', port: 0 },
      { type: 'i', display: 'Resurrected in 2024 for the Kiroween Hackathon', selector: '', host: '', port: 0 },
      { type: 'i', display: 'Frankenstein Category: Stitching 1991 + 2024 Together', selector: '', host: '', port: 0 },
    ]
  },

  // Library submenu
  '/library': {
    type: 'menu',
    items: [
      { type: 'i', display: '🏰  THE NECROMANCER\'S LIBRARY', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: 'i', display: 'Ancient texts preserved in the digital ether...', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: '0', display: '📖  Introduction to Gophermancy', selector: '/library/intro.txt', host: 'localhost', port: 7070 },
      { type: '0', display: '📖  The Art of Protocol Necromancy', selector: '/library/necromancy.txt', host: 'localhost', port: 7070 },
      { type: '0', display: '📖  MCP: The Modern Incantation', selector: '/library/mcp.txt', host: 'localhost', port: 7070 },
      { type: '1', display: '📚  Restricted Section', selector: '/library/restricted', host: 'localhost', port: 7070 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: '1', display: '⬅️   Return to Entrance', selector: '/', host: 'localhost', port: 7070 },
    ]
  },

  // Restricted section
  '/library/restricted': {
    type: 'menu',
    items: [
      { type: 'i', display: '⚠️  RESTRICTED SECTION ⚠️', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: 'i', display: 'Forbidden knowledge lies within...', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: '0', display: '🔒  The Lost Art of Telnet', selector: '/library/restricted/telnet.txt', host: 'localhost', port: 7070 },
      { type: '0', display: '🔒  Summoning Gopher+ Spirits', selector: '/library/restricted/gopherplus.txt', host: 'localhost', port: 7070 },
      { type: '3', display: '❌  The Necronomicon (Access Denied)', selector: '/error', host: 'error.host', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: '1', display: '⬅️   Back to Library', selector: '/library', host: 'localhost', port: 7070 },
    ]
  },

  // Spells submenu
  '/spells': {
    type: 'menu',
    items: [
      { type: 'i', display: '⚗️  SPELL COMPONENTS', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: 'i', display: 'Essential ingredients for protocol resurrection...', selector: '', host: '', port: 0 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: '0', display: '✨  TCP Sockets (Binding Ritual)', selector: '/spells/sockets.txt', host: 'localhost', port: 7070 },
      { type: '0', display: '✨  CRLF Line Endings (Sacred Runes)', selector: '/spells/crlf.txt', host: 'localhost', port: 7070 },
      { type: '0', display: '✨  Tab Separators (Divination Marks)', selector: '/spells/tabs.txt', host: 'localhost', port: 7070 },
      { type: '0', display: '✨  The Period Terminator (Sealing Sigil)', selector: '/spells/terminator.txt', host: 'localhost', port: 7070 },
      { type: 'i', display: '', selector: '', host: '', port: 0 },
      { type: '1', display: '⬅️   Return to Entrance', selector: '/', host: 'localhost', port: 7070 },
    ]
  },

  // Text documents
  '/manifesto.txt': {
    type: 'text',
    lines: [
      '═══════════════════════════════════════════════════════════',
      '         THE GOPHERMANCER MANIFESTO',
      '═══════════════════════════════════════════════════════════',
      '',
      'In the year 1991, the Gopher protocol was born.',
      'Simple. Elegant. A hierarchical document system that',
      'predated the World Wide Web as we know it.',
      '',
      'By the year 2000, it was declared dead.',
      'HTTP won. HTML won. The web consumed everything.',
      '',
      'But protocols never truly die.',
      'They wait. They linger in forgotten RFCs.',
      'They haunt old servers still running in dusty closets.',
      '',
      'In 2024, we are necromancers.',
      'We reach into the past and pull forward what was lost.',
      'We bridge RFC 1436 (1991) with the Model Context Protocol (2024).',
      '',
      'Why?',
      '',
      '  1. Because we can.',
      '  2. Because AI agents need simple protocols too.',
      '  3. Because Gopherspace still exists, and someone should visit.',
      '  4. Because stitching incompatible technologies together',
      '     is the essence of the Frankenstein spirit.',
      '',
      'This is Gophermancer.',
      'Ancient protocols. Modern tools. Pure alchemy.',
      '',
      '💀 Resurrected by necromancy and Node.js 💀',
      '',
      '═══════════════════════════════════════════════════════════',
    ]
  },

  '/rfc1436.txt': {
    type: 'text',
    lines: [
      'GOPHER PROTOCOL - RFC 1436 (March 1993)',
      '',
      'A brief summary for the impatient necromancer:',
      '',
      'REQUEST FORMAT:',
      '  <selector>\\r\\n',
      '',
      'RESPONSE FORMAT (Menu):',
      '  <type><display>\\t<selector>\\t<host>\\t<port>\\r\\n',
      '  ...',
      '',
      'RESPONSE FORMAT (Text):',
      '  <line>\\r\\n',
      '  ...',
      '  .\\r\\n',
      '',
      'ITEM TYPES:',
      '  0 = Text file',
      '  1 = Directory (menu)',
      '  3 = Error',
      '  7 = Search server',
      '  9 = Binary file',
      '  i = Informational text (no link)',
      '',
      'CRITICAL DETAILS:',
      '  - Line endings are CRLF (\\r\\n), not just LF',
      '  - Fields are separated by TAB (\\t)',
      '  - Text documents end with a single period on its own line',
      '  - One request, one response, then the connection closes',
      '',
      'That\'s it. That\'s the whole protocol.',
      'Simple enough to implement in a weekend.',
      'Powerful enough to build a distributed information system.',
      '',
      'Read the full RFC at:',
      'https://www.rfc-editor.org/rfc/rfc1436',
    ]
  },

  '/library/intro.txt': {
    type: 'text',
    lines: [
      'INTRODUCTION TO GOPHERMANCY',
      '',
      'Gophermancy is the art of resurrecting dead protocols.',
      '',
      'The Gopher protocol died in the late 1990s, killed by HTTP',
      'and the rise of the graphical web. But Gopherspace never',
      'fully disappeared. A handful of servers remain, maintained',
      'by enthusiasts and historians.',
      '',
      'In 2024, we asked: what if AI agents could browse Gopherspace?',
      '',
      'The Model Context Protocol (MCP) provides a standard way for',
      'AI agents to access external tools and data sources. By',
      'implementing Gopher as MCP tools, we give modern agents access',
      'to a forgotten corner of the internet.',
      '',
      'This is not just a technical exercise. It\'s a statement:',
      '',
      '  OLD PROTOCOLS STILL MATTER.',
      '  SIMPLE PROTOCOLS ARE ELEGANT.',
      '  INCOMPATIBLE TECHNOLOGIES CAN BE BRIDGED.',
      '',
      'Welcome to the crypt.',
      'Welcome to Gophermancer.',
    ]
  },

  '/library/necromancy.txt': {
    type: 'text',
    lines: [
      'THE ART OF PROTOCOL NECROMANCY',
      '',
      'Step 1: Find a dead protocol',
      '  - Gopher (RFC 1436) - deceased 1999',
      '  - Still has a pulse in a few servers',
      '',
      'Step 2: Study its anatomy',
      '  - Read the RFC',
      '  - Understand the wire format',
      '  - Test against living specimens',
      '',
      'Step 3: Build a bridge to the present',
      '  - Modern transport: Model Context Protocol',
      '  - Ancient transport: TCP sockets + CRLF',
      '  - The bridge: your code',
      '',
      'Step 4: Summon the spirits',
      '  - Connect to gopher.floodgap.com',
      '  - Send a request',
      '  - Parse the response',
      '  - Present it to a modern agent',
      '',
      'Step 5: Prove it works',
      '  - Write tests',
      '  - Build a UI',
      '  - Generate static HTML',
      '  - Show it to judges',
      '',
      'You are now a necromancer.',
      'Go forth and resurrect.',
    ]
  },

  '/library/mcp.txt': {
    type: 'text',
    lines: [
      'MCP: THE MODERN INCANTATION',
      '',
      'The Model Context Protocol (MCP) is Anthropic\'s standard',
      'for connecting AI agents to external tools and data.',
      '',
      'Key concepts:',
      '',
      '  TOOLS: Functions an agent can call',
      '    - gopher_browse(url) -> menu items',
      '    - gopher_fetch(url) -> text content',
      '    - gopher_search(url, query) -> results',
      '    - gopher_spelunk(url, depth, limit) -> crawl map',
      '',
      '  TRANSPORT: JSON-RPC over stdio',
      '    - Agent sends requests on stdin',
      '    - Server sends responses on stdout',
      '',
      '  SCHEMAS: Tools describe their parameters',
      '    - Type definitions in JSON Schema',
      '    - Self-documenting interface',
      '',
      'Why MCP for Gopher?',
      '',
      '  1. Agents get structured access to Gopherspace',
      '  2. No need to teach agents Gopher wire protocol',
      '  3. Tools can be composed and chained',
      '  4. The bridge makes the ancient modern',
      '',
      'This is the incantation.',
      'This is how we summon the past into the present.',
    ]
  },

  '/library/restricted/telnet.txt': {
    type: 'text',
    lines: [
      'THE LOST ART OF TELNET',
      '',
      '[RESTRICTED KNOWLEDGE]',
      '',
      'Telnet (type 8) is a Gopher item type that launches',
      'a Telnet session instead of transferring a file.',
      '',
      'Example:',
      '  8BBS Login\\ttelnet://bbs.example.com\\t\\t',
      '',
      'When selected, a Gopher client should:',
      '  1. NOT fetch over Gopher protocol',
      '  2. Launch a Telnet client',
      '  3. Connect to the specified host',
      '',
      'Gophermancer does not implement this.',
      'Some arts are too dangerous to resurrect.',
      '',
      '(Also, Telnet is insecure and nobody uses it anymore.)',
    ]
  },

  '/library/restricted/gopherplus.txt': {
    type: 'text',
    lines: [
      'SUMMONING GOPHER+ SPIRITS',
      '',
      '[RESTRICTED KNOWLEDGE]',
      '',
      'Gopher+ is an extension to the original Gopher protocol.',
      'It adds:',
      '  - Metadata queries',
      '  - Forms and interactive queries',
      '  - Alternative views of resources',
      '',
      'Almost nobody implemented it.',
      'Even fewer servers still support it.',
      '',
      'Gophermancer implements only RFC 1436 (original Gopher).',
      'Gopher+ is a spirit too restless to be controlled.',
      '',
      'Some dead things should stay dead.',
    ]
  },

  '/spells/sockets.txt': {
    type: 'text',
    lines: [
      'SPELL: TCP SOCKETS (Binding Ritual)',
      '',
      'To summon a connection to Gopherspace:',
      '',
      '  import { connect } from \'node:net\';',
      '',
      '  const socket = connect(port, host);',
      '',
      '  socket.on(\'connect\', () => {',
      '    // Send request',
      '  });',
      '',
      '  socket.on(\'data\', (chunk) => {',
      '    // Receive response',
      '  });',
      '',
      '  socket.on(\'end\', () => {',
      '    // Connection closed',
      '  });',
      '',
      'This is the foundation.',
      'All protocol necromancy begins with sockets.',
    ]
  },

  '/spells/crlf.txt': {
    type: 'text',
    lines: [
      'SPELL: CRLF LINE ENDINGS (Sacred Runes)',
      '',
      'Gopher requires CRLF (\\r\\n) line endings.',
      'Not just LF (\\n).',
      'Not just CR (\\r).',
      'Both. Together. Always.',
      '',
      'Why?',
      '  - Because RFC 1436 says so',
      '  - Because it was written in 1991',
      '  - Because Unix vs Windows line endings were a thing',
      '',
      'Correct encoding:',
      '  const request = selector + \'\\r\\n\';',
      '',
      'Incorrect encoding:',
      '  const request = selector + \'\\n\';  // WRONG',
      '',
      'Get this wrong and the spirits will not answer.',
    ]
  },

  '/spells/tabs.txt': {
    type: 'text',
    lines: [
      'SPELL: TAB SEPARATORS (Divination Marks)',
      '',
      'Gopher menu lines are tab-separated:',
      '',
      '  <type><display>\\t<selector>\\t<host>\\t<port>\\r\\n',
      '',
      'Example:',
      '  0README\\t/README.txt\\tgopher.example.com\\t70\\r\\n',
      '',
      'Parsing:',
      '  const [display, selector, host, port] = rest.split(\'\\t\');',
      '',
      'Critical detail:',
      '  - The first character is the type (NOT tab-separated)',
      '  - Everything after the type is split by tabs',
      '',
      'Missing tabs? Treat missing fields as empty strings.',
      'Extra tabs? Ignore them.',
      '',
      'Be lenient in what you accept.',
      'Be strict in what you send.',
    ]
  },

  '/spells/terminator.txt': {
    type: 'text',
    lines: [
      'SPELL: THE PERIOD TERMINATOR (Sealing Sigil)',
      '',
      'Gopher text documents end with a single period:',
      '',
      '  Line 1\\r\\n',
      '  Line 2\\r\\n',
      '  Line 3\\r\\n',
      '  .\\r\\n',
      '',
      'The period must be:',
      '  - On its own line',
      '  - Exactly one character',
      '  - Followed by CRLF',
      '',
      'Do NOT double periods like SMTP does.',
      'A line starting with a period is NOT escaped.',
      '',
      'Example that confuses beginners:',
      '  .bashrc\\r\\n',
      '  .profile\\r\\n',
      '  .\\r\\n',
      '',
      'The first two lines are content.',
      'The third line is the terminator.',
      '',
      'This is the sealing sigil.',
      'Without it, the document is incomplete.',
    ]
  },

  // Search server
  '/search': {
    type: 'search',
    handler: (query) => {
      const results = [];
      const lowerQuery = query.toLowerCase();

      // Search through content
      const searchableItems = [
        { keywords: ['gopher', 'protocol', 'rfc', '1436'], type: '0', display: '⚰️  Gopher Protocol Burial Records (RFC 1436)', selector: '/rfc1436.txt' },
        { keywords: ['manifesto', 'about', 'what', 'why'], type: '0', display: '📜  The Ancient Manifesto', selector: '/manifesto.txt' },
        { keywords: ['intro', 'introduction', 'welcome', 'start'], type: '0', display: '📖  Introduction to Gophermancy', selector: '/library/intro.txt' },
        { keywords: ['necromancy', 'necromancer', 'art'], type: '0', display: '📖  The Art of Protocol Necromancy', selector: '/library/necromancy.txt' },
        { keywords: ['mcp', 'model', 'context', 'protocol', 'modern'], type: '0', display: '📖  MCP: The Modern Incantation', selector: '/library/mcp.txt' },
        { keywords: ['library', 'books', 'texts'], type: '1', display: '🏰  The Necromancer\'s Library', selector: '/library' },
        { keywords: ['spell', 'spells', 'magic', 'component'], type: '1', display: '⚗️  Spell Components', selector: '/spells' },
        { keywords: ['socket', 'tcp', 'connection'], type: '0', display: '✨  TCP Sockets (Binding Ritual)', selector: '/spells/sockets.txt' },
        { keywords: ['crlf', 'line', 'ending', 'rune'], type: '0', display: '✨  CRLF Line Endings (Sacred Runes)', selector: '/spells/crlf.txt' },
        { keywords: ['tab', 'separator', 'divination'], type: '0', display: '✨  Tab Separators (Divination Marks)', selector: '/spells/tabs.txt' },
        { keywords: ['period', 'terminator', 'seal'], type: '0', display: '✨  The Period Terminator (Sealing Sigil)', selector: '/spells/terminator.txt' },
      ];

      // Add search header
      results.push({ type: 'i', display: `🔮  SCRYING POOL RESULTS FOR: "${query}"`, selector: '', host: '', port: 0 });
      results.push({ type: 'i', display: '', selector: '', host: '', port: 0 });

      let foundCount = 0;
      for (const item of searchableItems) {
        if (item.keywords.some(kw => kw.includes(lowerQuery) || lowerQuery.includes(kw))) {
          results.push({ type: item.type, display: item.display, selector: item.selector, host: 'localhost', port: 7070 });
          foundCount++;
        }
      }

      if (foundCount === 0) {
        results.push({ type: 'i', display: '💀  The spirits reveal nothing...', selector: '', host: '', port: 0 });
        results.push({ type: 'i', display: '    Try: gopher, mcp, spell, library, necromancy', selector: '', host: '', port: 0 });
      } else {
        results.push({ type: 'i', display: '', selector: '', host: '', port: 0 });
        results.push({ type: 'i', display: `Found ${foundCount} result(s)`, selector: '', host: '', port: 0 });
      }

      return results;
    }
  }
};
