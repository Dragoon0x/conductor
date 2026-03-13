// ═══════════════════════════════════════════
// CONDUCTOR v3 — WebSocket Bridge
// ═══════════════════════════════════════════

import { WebSocketServer } from 'ws'

function log() { process.stderr.write('[bridge] ' + Array.prototype.join.call(arguments, ' ') + '\n') }

export function createBridge(port) {
  port = port || parseInt(process.env.CONDUCTOR_PORT) || 3055
  var wss = null
  var client = null
  var pending = new Map()
  var msgId = 0
  var isOwner = false

  function start() {
    return new Promise(function(resolve) {
      try {
        wss = new WebSocketServer({ port: port })
        wss.on('listening', function() { isOwner = true; log('WebSocket server on port ' + port); resolve() })
        wss.on('connection', function(ws) {
          client = ws
          log('Figma plugin connected')
          ws.on('message', function(data) {
            try {
              var msg = JSON.parse(data.toString())
              if (msg.id && pending.has(msg.id)) {
                var p = pending.get(msg.id)
                clearTimeout(p.timer)
                pending.delete(msg.id)
                if (msg.error) p.reject(new Error(msg.error))
                else p.resolve(msg.result)
              }
            } catch (e) { log('Parse error:', e.message) }
          })
          ws.on('close', function() { client = null; log('Figma plugin disconnected') })
          ws.on('error', function(e) { log('WS error:', e.message) })
        })
        wss.on('error', function(e) {
          if (e.code === 'EADDRINUSE') {
            log('Port ' + port + ' in use — another Conductor instance is running. This instance will handle MCP only.')
            wss = null
            resolve()
          } else {
            log('Server error:', e.message)
            resolve()
          }
        })
      } catch (e) {
        log('Bridge start error:', e.message)
        resolve()
      }
    })
  }

  function stop() { if (wss && isOwner) { wss.close(); wss = null } }

  function isConnected() { return client !== null && client.readyState === 1 }

  function send(command, data, timeout) {
    timeout = timeout || 15000
    return new Promise(function(resolve, reject) {
      if (!isConnected()) return reject(new Error('Figma plugin not connected. Run the Conductor plugin in Figma, and make sure the WebSocket server is running on port ' + port))
      var id = ++msgId
      var timer = setTimeout(function() {
        pending.delete(id)
        reject(new Error('Timeout waiting for Figma response (' + timeout + 'ms)'))
      }, timeout)
      pending.set(id, { resolve: resolve, reject: reject, timer: timer })
      client.send(JSON.stringify({ id: id, command: command, data: data }))
    })
  }

  return { start: start, stop: stop, isConnected: isConnected, send: send, getPort: function() { return port } }
}
