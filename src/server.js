// ═══════════════════════════════════════════
// CONDUCTOR — MCP Server + Relay Bridge
// ═══════════════════════════════════════════
// MCP protocol over stdio (for Cursor/Claude Code).
// WebSocket relay to Figma plugin (for canvas operations).
//
// Pure design tools (color_palette, type_scale, etc.) resolve locally.
// Figma tools (create_frame, read_node, etc.) forward through WebSocket.

import { TOOLS } from './tools/registry.js';
import { handleTool } from './tools/handlers.js';
import { Relay } from './relay.js';

var SERVER_INFO = { name: 'conductor-figma', version: '0.2.0' };
var CAPABILITIES = { tools: {} };
var relay = null;

export async function startServer(options) {
  options = options || {};
  var port = options.port || 9800;

  relay = new Relay(port);
  var relayStarted = await relay.start();

  if (relayStarted) {
    process.stderr.write('CONDUCTOR: MCP + relay started (' + TOOLS.length + ' tools, ws://localhost:' + port + ')\n');
  } else {
    process.stderr.write('CONDUCTOR: MCP started (' + TOOLS.length + ' tools, no relay — install ws for Figma bridge)\n');
  }

  var buffer = '';

  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', function(chunk) {
    buffer += chunk;
    var lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim();
      if (!trimmed) continue;
      try {
        handleMessage(JSON.parse(trimmed));
      } catch (err) {
        sendError(null, -32700, 'Parse error');
      }
    }
  });

  process.stdin.on('end', function() {
    if (relay) relay.stop();
    process.exit(0);
  });
}

async function handleMessage(msg) {
  var id = msg.id;
  var method = msg.method;
  var params = msg.params || {};

  switch (method) {
    case 'initialize':
      sendResult(id, { protocolVersion: '2024-11-05', serverInfo: SERVER_INFO, capabilities: CAPABILITIES });
      break;

    case 'initialized':
      break;

    case 'tools/list':
      sendResult(id, {
        tools: TOOLS.map(function(t) { return { name: t.name, description: t.description, inputSchema: t.inputSchema }; }),
      });
      break;

    case 'tools/call':
      var toolName = params.name;
      var toolArgs = params.arguments || {};
      if (!toolName) { sendError(id, -32602, 'Missing tool name'); return; }
      await handleToolCall(id, toolName, toolArgs);
      break;

    case 'ping':
      sendResult(id, {});
      break;

    default:
      if (id !== undefined) sendError(id, -32601, 'Method not found: ' + method);
  }
}

async function handleToolCall(id, toolName, toolArgs) {
  // If tool is a direct Figma command and plugin is connected — forward it
  if (relay && relay.isFigmaCommand(toolName) && relay.isConnected()) {
    process.stderr.write('CONDUCTOR: -> Figma: ' + toolName + '\n');
    try {
      var figmaResult = await relay.sendToPlugin(toolName, toolArgs);
      process.stderr.write('CONDUCTOR: <- Figma: ' + (figmaResult.name || figmaResult.id || 'ok') + '\n');
      sendResult(id, { content: [{ type: 'text', text: JSON.stringify(figmaResult, null, 2) }] });
    } catch (err) {
      sendResult(id, { content: [{ type: 'text', text: JSON.stringify({ error: String(err) }) }] });
    }
    return;
  }

  // Run through design intelligence handler
  var result = handleTool(toolName, toolArgs, null);

  // Check if handler produced a Figma action we should forward
  if (relay && relay.isConnected()) {
    try {
      var data = JSON.parse(result.content[0].text);
      if (data.action && relay.isFigmaCommand(data.action)) {
        process.stderr.write('CONDUCTOR: -> Figma (via ' + toolName + '): ' + data.action + '\n');
        var fResult = await relay.sendToPlugin(data.action, data);
        process.stderr.write('CONDUCTOR: <- Figma: ' + (fResult.name || fResult.id || 'ok') + '\n');
        data._figmaResult = fResult;
        sendResult(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
        return;
      }
    } catch (e) { /* not JSON or no action */ }
  }

  // If Figma command but plugin not connected — add note
  if (relay && relay.isFigmaCommand(toolName) && !relay.isConnected()) {
    try {
      var parsed = JSON.parse(result.content[0].text);
      parsed._note = 'Figma plugin not connected. Connect the CONDUCTOR plugin in Figma to execute on canvas.';
      result = { content: [{ type: 'text', text: JSON.stringify(parsed, null, 2) }] };
    } catch (e) { /* ignore */ }
  }

  sendResult(id, result);
}

function sendResult(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: id, result: result }) + '\n');
}

function sendError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: id, error: { code: code, message: message } }) + '\n');
}
