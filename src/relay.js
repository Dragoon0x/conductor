// ═══════════════════════════════════════════
// CONDUCTOR — WebSocket Relay
// ═══════════════════════════════════════════
// Bridges MCP stdio (from Cursor) to WebSocket (to Figma plugin).
//
// Flow:
//   Cursor → MCP stdio → CONDUCTOR → design logic (local)
//                                   → figma commands (WebSocket) → Plugin → Figma API
//                                   ← results ← WebSocket ←
//         ← MCP stdio ← CONDUCTOR ←

import { createServer } from 'node:http';

// Tools that need Figma (sent over WebSocket to plugin)
const FIGMA_COMMANDS = new Set([
  // Create
  'create_frame', 'create_text', 'create_rect', 'create_section', 'create_component',
  // Layout
  'set_auto_layout', 'set_constraints', 'apply_grid', 'align_nodes',
  // Style
  'set_fills', 'set_strokes', 'set_effects', 'set_corner_radius', 'set_opacity',
  // Typography
  'set_text_props', 'load_font',
  // Read
  'get_selection', 'get_page_info', 'get_styles', 'get_components',
  'read_node', 'read_tree', 'read_spacing', 'read_colors', 'read_typography',
  // Edit
  'rename_node', 'move_node', 'resize_node', 'delete_node',
  'clone_node', 'group_nodes', 'ungroup_node', 'reorder_node',
  // Export
  'export_png', 'export_svg',
  // Viewport
  'zoom_to', 'scroll_to',
  // Meta
  'ping',
]);

export class Relay {
  constructor(port) {
    this.port = port || 9800;
    this.pluginSocket = null;
    this.pendingCallbacks = new Map();
    this.cmdId = 0;
    this.server = null;
    this.wss = null;
  }

  async start() {
    // Dynamic import ws (may not be installed — we bundle our own minimal WS)
    let WebSocketServer;
    try {
      const ws = await import('ws');
      WebSocketServer = ws.WebSocketServer || ws.default.WebSocketServer;
    } catch (e) {
      process.stderr.write('CONDUCTOR relay: "ws" package not found. Install with: npm install ws\n');
      process.stderr.write('Falling back to MCP-only mode (no Figma bridge).\n');
      return false;
    }

    this.server = createServer();
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (socket) => {
      this.pluginSocket = socket;
      process.stderr.write('CONDUCTOR relay: Figma plugin connected\n');

      socket.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handlePluginMessage(msg);
        } catch (e) {
          // ignore
        }
      });

      socket.on('close', () => {
        this.pluginSocket = null;
        process.stderr.write('CONDUCTOR relay: Figma plugin disconnected\n');
      });

      socket.on('error', () => {
        this.pluginSocket = null;
      });
    });

    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        process.stderr.write(`CONDUCTOR relay: WebSocket listening on ws://localhost:${this.port}\n`);
        resolve(true);
      });
    });
  }

  handlePluginMessage(msg) {
    if (msg.type === 'plugin_ready') {
      process.stderr.write(`CONDUCTOR relay: Plugin ready (v${msg.version || '?'})\n`);
      return;
    }

    if (msg.type === 'result' && msg.id !== undefined) {
      const callback = this.pendingCallbacks.get(msg.id);
      if (callback) {
        this.pendingCallbacks.delete(msg.id);
        callback(msg.data || {});
      }
      return;
    }
  }

  isConnected() {
    return this.pluginSocket !== null && this.pluginSocket.readyState === 1; // WebSocket.OPEN
  }

  /**
   * Send a command to the Figma plugin and wait for result.
   * Returns a Promise that resolves with the plugin's response.
   */
  sendToPlugin(commandType, commandData, timeout) {
    timeout = timeout || 15000;

    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        resolve({ error: 'Figma plugin not connected. Open the CONDUCTOR plugin in Figma and click Connect.' });
        return;
      }

      var id = ++this.cmdId;
      var timer = setTimeout(function() {
        this.pendingCallbacks.delete(id);
        resolve({ error: 'Timeout waiting for Figma plugin response' });
      }.bind(this), timeout);

      this.pendingCallbacks.set(id, function(result) {
        clearTimeout(timer);
        resolve(result);
      });

      this.pluginSocket.send(JSON.stringify({
        type: 'command',
        id: id,
        command: { type: commandType, data: commandData || {} },
      }));
    });
  }

  /**
   * Check if a tool name maps to a Figma command.
   */
  isFigmaCommand(toolName) {
    return FIGMA_COMMANDS.has(toolName);
  }

  /**
   * Map a high-level tool call to one or more Figma commands.
   * Some tools (like create_page) produce multiple Figma commands.
   * Some tools (like color_palette) are pure design logic — no Figma needed.
   */
  getFigmaCommand(toolName, toolArgs) {
    // Direct mappings — tool name IS the Figma command
    if (FIGMA_COMMANDS.has(toolName)) {
      return { command: toolName, data: toolArgs };
    }

    // Tools that generate Figma commands from design logic output
    // The handler produces a JSON response with an "action" field
    // that maps to a Figma command
    return null;
  }

  stop() {
    if (this.wss) this.wss.close();
    if (this.server) this.server.close();
  }
}
