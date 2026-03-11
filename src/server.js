// ═══════════════════════════════════════════
// CONDUCTOR — MCP Server
// ═══════════════════════════════════════════
// Model Context Protocol server over stdio.
// Registers 61 design-intelligent tools for AI editors.

import { TOOLS } from './tools/registry.js';
import { handleTool } from './tools/handlers.js';

const SERVER_INFO = {
  name: 'conductor-figma',
  version: '0.1.0',
};

const CAPABILITIES = {
  tools: {},
};

/**
 * Start the MCP server on stdio.
 * Reads JSON-RPC messages from stdin, writes responses to stdout.
 */
export function startServer() {
  let buffer = '';

  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;

    // Process complete lines
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const message = JSON.parse(trimmed);
        handleMessage(message);
      } catch (err) {
        sendError(null, -32700, 'Parse error');
      }
    }
  });

  process.stdin.on('end', () => {
    process.exit(0);
  });

  // Log startup to stderr (not stdout — that's for MCP protocol)
  process.stderr.write(`CONDUCTOR MCP server started (${TOOLS.length} tools)\n`);
}

function handleMessage(msg) {
  // JSON-RPC 2.0
  const { id, method, params } = msg;

  switch (method) {
    case 'initialize':
      sendResult(id, {
        protocolVersion: '2024-11-05',
        serverInfo: SERVER_INFO,
        capabilities: CAPABILITIES,
      });
      break;

    case 'initialized':
      // Notification, no response needed
      break;

    case 'tools/list':
      sendResult(id, {
        tools: TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      });
      break;

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (!toolName) {
        sendError(id, -32602, 'Missing tool name');
        return;
      }

      const result = handleTool(toolName, toolArgs, null);
      sendResult(id, result);
      break;
    }

    case 'ping':
      sendResult(id, {});
      break;

    default:
      if (id !== undefined) {
        sendError(id, -32601, `Method not found: ${method}`);
      }
  }
}

function sendResult(id, result) {
  const response = { jsonrpc: '2.0', id, result };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message) {
  const response = { jsonrpc: '2.0', id, error: { code, message } };
  process.stdout.write(JSON.stringify(response) + '\n');
}
