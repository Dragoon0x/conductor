import { TOOL_LIST, TOOL_COUNT, getTool, CATEGORIES } from './tools/registry.js'
import { handleTool } from './tools/handlers.js'
import { createBridge } from './bridge.js'

var VERSION = '3.0.4'
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

if (process.stdout._handle && process.stdout._handle.setBlocking) {
  process.stdout._handle.setBlocking(true)
}

var buffer = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', function(chunk) {
  buffer += chunk
  processBuffer()
})

function processBuffer() {
  while (true) {
    var nlIdx = buffer.indexOf('\n')
    if (nlIdx === -1) {
      if (buffer.length > 0 && buffer[0] === '{') {
        try { JSON.parse(buffer) } catch(e) { break }
        tryParse(buffer)
        buffer = ''
      }
      break
    }
    var line = buffer.slice(0, nlIdx).trim()
    buffer = buffer.slice(nlIdx + 1)
    if (line.length === 0) continue
    if (line[0] === '{') tryParse(line)
  }
}

function tryParse(str) {
  try {
    var msg = JSON.parse(str)
    handleMessage(msg)
  } catch (e) { log('Parse error:', e.message) }
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n')
}

function respond(id, result) { send({ jsonrpc: '2.0', id: id, result: result }) }
function respondError(id, code, message) { send({ jsonrpc: '2.0', id: id, error: { code: code, message: message } }) }

function handleMessage(msg) {
  var id = msg.id
  var method = msg.method
  var params = msg.params || {}

  log('<- ' + method + (id !== undefined ? ' #' + id : ''))

  switch (method) {
    case 'initialize':
      ensureBridge()
      log('Conductor v' + VERSION + ' ready — ' + TOOL_COUNT + ' tools')
      respond(id, {
        protocolVersion: params.protocolVersion || '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'conductor-figma', version: VERSION },
      })
      return

    case 'notifications/initialized':
    case 'notifications/cancelled':
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
      if (id !== undefined) respondError(id, -32601, 'Unknown method: ' + method)
  }
}

process.on('SIGINT', function() { if (bridge) bridge.stop(); process.exit(0) })
process.on('SIGTERM', function() { if (bridge) bridge.stop(); process.exit(0) })
