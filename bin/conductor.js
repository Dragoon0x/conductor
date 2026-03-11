#!/usr/bin/env node

import { startServer } from '../src/server.js';
import { TOOLS, CATEGORIES } from '../src/tools/registry.js';

var args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  ⊞ CONDUCTOR — Design-intelligent MCP server for Figma

  Usage:
    conductor-figma                Start MCP server + Figma relay
    conductor-figma --port 9800    Set WebSocket port (default: 9800)
    conductor-figma --list         List all ${TOOLS.length} tools
    conductor-figma --categories   Show tool categories
    conductor-figma --help         Show this help

  How it works:
    1. Cursor sends tool calls via MCP (stdio)
    2. Design tools (color, type, spacing) resolve locally
    3. Figma tools forward through WebSocket to the plugin
    4. Plugin executes on canvas, results flow back

  Setup:
    ~/.cursor/mcp.json:
    {
      "mcpServers": {
        "conductor": {
          "command": "npx",
          "args": ["-y", "conductor-figma"]
        }
      }
    }

  Then open the CONDUCTOR plugin in Figma and click Connect.

  ${TOOLS.length} tools · ${Object.keys(CATEGORIES).length} categories
  Built by 0xDragoon · MIT License
`);
  process.exit(0);
}

if (args.includes('--list')) {
  for (var entries = Object.entries(CATEGORIES), i = 0; i < entries.length; i++) {
    var catKey = entries[i][0], cat = entries[i][1];
    var tools = TOOLS.filter(function(t) { return t.category === catKey; });
    console.log('\n  ' + cat.icon + ' ' + cat.label + ' (' + tools.length + ')');
    for (var j = 0; j < tools.length; j++) {
      console.log('    ' + tools[j].name.padEnd(28) + ' ' + tools[j].description.slice(0, 70));
    }
  }
  console.log('\n  ' + TOOLS.length + ' tools total\n');
  process.exit(0);
}

if (args.includes('--categories')) {
  for (var entries2 = Object.entries(CATEGORIES), k = 0; k < entries2.length; k++) {
    var key = entries2[k][0], cat2 = entries2[k][1];
    var count = TOOLS.filter(function(t) { return t.category === key; }).length;
    console.log('  ' + cat2.icon + ' ' + cat2.label.padEnd(18) + ' ' + count + ' tools');
  }
  console.log('\n  ' + TOOLS.length + ' tools total');
  process.exit(0);
}

// Parse port
var port = 9800;
var portIdx = args.indexOf('--port');
if (portIdx !== -1 && args[portIdx + 1]) {
  port = parseInt(args[portIdx + 1]) || 9800;
}

// Start MCP server with relay
startServer({ port: port });
