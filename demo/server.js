#!/usr/bin/env node
/**
 * Demo Gopher Server
 * Serves the Gophermancer demo content
 */

import { createGopherServer } from '../src/gopher/server.js';
import { demoContent } from './content.js';

const DEFAULT_PORT = 7070;
const portArg = parseInt(process.argv[2] || DEFAULT_PORT, 10);

const { server, port } = await createGopherServer(demoContent, portArg);

console.log(`💀 Gophermancer Demo Server risen from the grave`);
console.log(`📡 Listening on port ${port}`);
console.log(`🔗 gopher://localhost:${port}/1/`);
console.log(`\nPress Ctrl+C to return to the grave...\n`);

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n💀 Returning to the grave...');
  server.close();
  process.exit(0);
});
