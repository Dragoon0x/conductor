// ═══════════════════════════════════════════
// CONDUCTOR v3 — MCP Server (stdio)
// ═══════════════════════════════════════════

import { TOOL_LIST, TOOL_COUNT, getTool, CATEGORIES } from './tools/registry.js'
import { handleTool } from './tools/handlers.js'
import { createBridge } from './bridge.js'

const VERSION = '3.0.0'
let bridge = null

function log(...args) { process.stderr.write('[conductor] ' + args.join(' ') + '\n') }

// ─── JSON-RPC over stdio ───
let buffer = ''

process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => {
  buffer += chunk
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n')
    if (headerEnd === -1) break
    const header = buffer.slice(0, headerEnd)
    const match = header.match(/Content-Length:\s*(\d+)/i)
    if (!match) { buffer = buffer.slice(headerEnd + 4); continue }
    const len = parseInt(match[1])
    const bodyStart = headerEnd + 4
    if (buffer.length < bodyStart + len) break
    const body = buffer.slice(bodyStart, bodyStart + len)
    buffer = buffer.slice(bodyStart + len)
    try {
      const msg = JSON.parse(body)
      handleMessage(msg)
    } catch (e) { log('Parse error:', e.message) }
  }
})

function send(msg) {
  const json = JSON.stringify(msg)
  const out = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`
  process.stdout.write(out)
}

function respond(id, result) { send({ jsonrpc: '2.0', id, result }) }
function respondError(id, code, message) { send({ jsonrpc: '2.0', id, error: { code, message } }) }

async function handleMessage(msg) {
  const { id, method, params } = msg

  switch (method) {
    case 'initialize':
      if (!bridge) {
        bridge = createBridge()
        await bridge.start()
      }
      return respond(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'conductor-figma', version: VERSION },
      })

    case 'notifications/initialized':
      log(`Conductor v${VERSION} ready — ${TOOL_COUNT} tools across ${Object.keys(CATEGORIES).length} categories`)
      return

    case 'tools/list':
      return respond(id, {
        tools: TOOL_LIST.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }))
      })

    case 'tools/call': {
      const { name, arguments: args } = params
      const tool = getTool(name)
      if (!tool) return respondError(id, -32601, `Unknown tool: ${name}`)

      try {
        const result = await handleTool(name, args || {}, bridge)
        return respond(id, {
          content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
        })
      } catch (e) {
        log(`Tool error [${name}]:`, e.message)
        return respond(id, {
          content: [{ type: 'text', text: `Error: ${e.message}` }],
          isError: true,
        })
      }
    }

    case 'ping':
      return respond(id, {})

    default:
      if (id) respondError(id, -32601, `Unknown method: ${method}`)
  }
}

process.on('SIGINT', () => { if (bridge) bridge.stop(); process.exit(0) })
process.on('SIGTERM', () => { if (bridge) bridge.stop(); process.exit(0) })
