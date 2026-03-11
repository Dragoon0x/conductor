// ═══════════════════════════════════════════
// CONDUCTOR — MCP Server + Orchestrator
// ═══════════════════════════════════════════
// When create_page or create_section is called:
//   1. Generates a blueprint (30-50 sequential commands)
//   2. Executes each one through the relay to the Figma plugin
//   3. Each command references results from previous commands ($ref)
//   4. Returns a summary of everything created

import { TOOLS } from './tools/registry.js';
import { handleTool } from './tools/handlers.js';
import { Relay } from './relay.js';
import { getBlueprint } from './blueprints.js';
import { executeSequence } from './orchestrator.js';

var SERVER_INFO = { name: 'conductor-figma', version: '0.3.0' };
var CAPABILITIES = { tools: {} };
var relay = null;

// Tools that trigger blueprint orchestration (multi-command sequences)
var BLUEPRINT_TOOLS = new Set(['create_page', 'create_section']);

export async function startServer(options) {
  options = options || {};
  var port = options.port || 9800;

  relay = new Relay(port);
  var relayStarted = await relay.start();

  if (relayStarted) {
    process.stderr.write('CONDUCTOR v0.3.0: MCP + orchestrator ready (' + TOOLS.length + ' tools, ws://localhost:' + port + ')\n');
  } else {
    process.stderr.write('CONDUCTOR v0.3.0: MCP ready (' + TOOLS.length + ' tools, no relay — install ws)\n');
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
      // Only expose high-level tools to Cursor.
      // Low-level Figma commands (create_frame, create_text, etc.) are hidden
      // because the orchestrator uses them internally via blueprints.
      var HIDDEN_FROM_AI = new Set([
        'create_frame', 'create_text', 'create_rect', 'create_ellipse', 'create_line',
        'create_svg_node', 'create_card', 'create_form', 'create_table', 'create_modal', 'create_nav',
        'layout_auto', 'layout_grid', 'layout_stack', 'layout_wrap', 'layout_constrain', 'layout_align', 'layout_nest',
        'set_fills', 'set_strokes', 'set_effects', 'set_corner_radius', 'set_opacity',
        'set_text_props', 'load_font', 'style_text_range',
        'rename_node', 'move_node', 'resize_node', 'delete_node', 'clone_node', 'group_nodes', 'ungroup_node', 'reorder_node',
        'find_nodes',
      ]);
      var visibleTools = TOOLS.filter(function(t) { return !HIDDEN_FROM_AI.has(t.name); });
      sendResult(id, {
        tools: visibleTools.map(function(t) { return { name: t.name, description: t.description, inputSchema: t.inputSchema }; }),
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

  // ═══ ORCHESTRATED BLUEPRINTS ═══
  // create_page and create_section generate 20-50 commands and execute them all
  if (BLUEPRINT_TOOLS.has(toolName) && relay && relay.isConnected()) {
    var blueprint = getBlueprint(toolName, toolArgs);

    if (blueprint && blueprint.commands && blueprint.commands.length > 0) {
      process.stderr.write('CONDUCTOR orchestrator: ' + toolName + ' -> ' + blueprint.commands.length + ' commands\n');
      process.stderr.write('CONDUCTOR orchestrator: ' + blueprint.description + '\n');

      var outcome = await executeSequence(relay, blueprint.commands);

      var summary = {
        tool: toolName,
        description: blueprint.description,
        totalCommands: outcome.totalSteps,
        completed: outcome.completedSteps,
        errors: outcome.errors.length,
        success: outcome.success,
        createdNodes: [],
      };

      // Collect all created node IDs and names
      for (var r = 0; r < outcome.results.length; r++) {
        var res = outcome.results[r];
        if (res && res.id) {
          summary.createdNodes.push({ id: res.id, name: res.name || '', type: res.type || '' });
        }
      }

      if (outcome.errors.length > 0) {
        summary.errorDetails = outcome.errors;
      }

      sendResult(id, { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] });
      return;
    }
  }

  // ═══ DIRECT FIGMA COMMANDS ═══
  // Single commands forwarded directly to plugin
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

  // ═══ DESIGN INTELLIGENCE (local) ═══
  var result = handleTool(toolName, toolArgs, null);

  // Check if handler produced a Figma action to forward
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

  // Blueprint tool but plugin not connected — return the blueprint spec
  if (BLUEPRINT_TOOLS.has(toolName)) {
    var bp = getBlueprint(toolName, toolArgs);
    if (bp) {
      var spec = {
        tool: toolName,
        description: bp.description,
        commandCount: bp.commands.length,
        _note: relay && !relay.isConnected()
          ? 'Figma plugin not connected. Connect the CONDUCTOR plugin to execute these ' + bp.commands.length + ' commands on canvas.'
          : 'WebSocket relay not available. Install ws package for Figma bridge.',
        commands: bp.commands.map(function(c, i) { return { step: i, type: c.type, name: c.data.name || c.data.text || '' }; }),
      };
      sendResult(id, { content: [{ type: 'text', text: JSON.stringify(spec, null, 2) }] });
      return;
    }
  }

  // Figma command but not connected — add note
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
