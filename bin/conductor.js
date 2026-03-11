#!/usr/bin/env node

import { startServer } from '../src/server.js';
import { TOOLS, CATEGORIES } from '../src/tools/registry.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  ⊞ CONDUCTOR — Design-intelligent MCP server for Figma

  Usage:
    conductor-figma              Start MCP server (stdio)
    conductor-figma --list       List all ${TOOLS.length} tools
    conductor-figma --categories Show tool categories
    conductor-figma --help       Show this help

  MCP Setup (Cursor):
    Add to ~/.cursor/mcp.json:

    {
      "mcpServers": {
        "conductor": {
          "command": "npx",
          "args": ["-y", "conductor-figma"]
        }
      }
    }

  ${TOOLS.length} tools · ${Object.keys(CATEGORIES).length} categories · Zero dependencies
  Built by 0xDragoon · MIT License
`);
  process.exit(0);
}

if (args.includes('--list')) {
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    const tools = TOOLS.filter(t => t.category === catKey);
    console.log(`\n  ${cat.icon} ${cat.label} (${tools.length})`);
    for (const t of tools) {
      console.log(`    ${t.name.padEnd(28)} ${t.description.slice(0, 70)}`);
    }
  }
  console.log(`\n  ${TOOLS.length} tools total\n`);
  process.exit(0);
}

if (args.includes('--categories')) {
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const tools = TOOLS.filter(t => t.category === key);
    console.log(`  ${cat.icon} ${cat.label.padEnd(18)} ${tools.length} tools`);
  }
  console.log(`\n  ${TOOLS.length} tools total`);
  process.exit(0);
}

// Default: start MCP server
startServer();
