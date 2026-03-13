// ═══════════════════════════════════════════
// CONDUCTOR v3 — MCP Server (stdio)
// ═══════════════════════════════════════════

import { TOOL_LIST, TOOL_COUNT, getTool, CATEGORIES } from './tools/registry.js'
import { handleTool } from './tools/handlers.js'
import { createBridge } from './bridge.js'

var VERSION = '3.0.3'
var bridge = null
var bridgeStarted = false

function log() { process.stderr.write('[conductor] ' + Array.prototype.join.call(arguments, ' ') + '\n') }

function ensureBridge() {
  if (!bridgeStarted) {
    bridgeStarted = true
    bridge = createBridge()
    bridge.start()
  }
  return bridge
}

// ─── JSON-RPC over stdio ───
var buffer = ''

process.stdin.setEncoding('utf8')
process.stdin.on('data', function(chunk) {
  buffer += chunk
  processBuffer()
})

function processBuffer() {
  while (true) {
    // Accept both \r\n\r\n and \n\n as header terminators
    var headerEnd = buffer.indexOf('\r\n\r\n')
    var headerLen = 4
    if (headerEnd === -1) {
      headerEnd = buffer.indexOf('\n\n')
      headerLen = 2
    }
    if (headerEnd === -1) break

    var header = buffer.slice(0, headerEnd)
    var match = header.match(/Content-Length:\s*(\d+)/i)
    if (!match) { buffer = buffer.slice(headerEnd + headerLen); continue }

    var len = parseInt(match[1])
    var bodyStart = headerEnd + headerLen
    if (buffer.length < bodyStart + len) break

    var body = buffer.slice(bodyStart, bodyStart + len)
    buffer = buffer.slice(bodyStart + len)

    try {
      var msg = JSON.parse(body)
      handleMessage(msg)
    } catch (e) { log('Parse error:', e.message) }
  }
}

function send(msg) {
  var json = JSON.stringify(msg)
  var out = 'Content-Length: ' + Buffer.byteLength(json) + '\r\n\r\n' + json
  process.stdout.write(out)
}

function respond(id, result) { send({ jsonrpc: '2.0', id: id, result: result }) }
function respondError(id, code, message) { send({ jsonrpc: '2.0', id: id, error: { code: code, message: message } }) }

function handleMessage(msg) {
  var id = msg.id
  var method = msg.method
  var params = msg.params || {}

  log('← ' + method + (id ? ' #' + id : ''))

  switch (method) {
    case 'initialize':
      ensureBridge()
      log('Conductor v' + VERSION + ' ready — ' + TOOL_COUNT + ' tools')
      respond(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'conductor-figma', version: VERSION },
      })
      return

    case 'notifications/initialized':
      return

    case 'tools/list':
      respond(id, {
        tools: TOOL_LIST.map(function(t) {
          return { name: t.name, description: t.description, inputSchema: t.inputSchema }
        })
      })
      return

    case 'tools/call':
      var name = params.name
      var args = params.arguments || {}
      var tool = getTool(name)
      if (!tool) { respondError(id, -32601, 'Unknown tool: ' + name); return }

      var b = ensureBridge()
      handleTool(name, args, b).then(function(result) {
        respond(id, {
          content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
        })
      }).catch(function(e) {
        log('Tool error [' + name + ']:', e.message)
        respond(id, {
          content: [{ type: 'text', text: 'Error: ' + e.message }],
          isError: true,
        })
      })
      return

    case 'ping':
      respond(id, {})
      return

    default:
      if (id) respondError(id, -32601, 'Unknown method: ' + method)
  }
}

process.on('SIGINT', function() { if (bridge) bridge.stop(); process.exit(0) })
process.on('SIGTERM', function() { if (bridge) bridge.stop(); process.exit(0) })
