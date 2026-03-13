// ═══════════════════════════════════════════
// CONDUCTOR v3 — WebSocket Bridge
// ═══════════════════════════════════════════

import { WebSocketServer } from 'ws'

function log(...args) { process.stderr.write('[bridge] ' + args.join(' ') + '\n') }

export function createBridge(port) {
  port = port || parseInt(process.env.CONDUCTOR_PORT) || 3055
  let wss = null
  let client = null
  let pending = new Map()
  let msgId = 0

  function start() {
    return new Promise((resolve) => {
      wss = new WebSocketServer({ port })
      wss.on('listening', () => { log(`WebSocket server on port ${port}`); resolve() })
      wss.on('connection', (ws) => {
        client = ws
        log('Figma plugin connected')
        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString())
            if (msg.id && pending.has(msg.id)) {
              const { resolve, reject, timer } = pending.get(msg.id)
              clearTimeout(timer)
              pending.delete(msg.id)
              if (msg.error) reject(new Error(msg.error))
              else resolve(msg.result)
            }
          } catch (e) { log('Parse error:', e.message) }
        })
        ws.on('close', () => { client = null; log('Figma plugin disconnected') })
        ws.on('error', (e) => log('WS error:', e.message))
      })
      wss.on('error', (e) => { log('Server error:', e.message); resolve() })
    })
  }

  function stop() { if (wss) { wss.close(); wss = null } }

  function isConnected() { return client !== null && client.readyState === 1 }

  function send(command, data, timeout = 15000) {
    return new Promise((resolve, reject) => {
      if (!isConnected()) return reject(new Error('Figma plugin not connected. Open Figma → Plugins → Development → Conductor'))
      const id = ++msgId
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`Timeout waiting for Figma response (${timeout}ms)`))
      }, timeout)
      pending.set(id, { resolve, reject, timer })
      client.send(JSON.stringify({ id, command, data }))
    })
  }

  return { start, stop, isConnected, send, getPort: () => port }
}
