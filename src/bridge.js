// ═══════════════════════════════════════════
// CONDUCTOR v3.3 — WebSocket Bridge
// ═══════════════════════════════════════════

import { WebSocketServer, WebSocket } from 'ws'

function log() { process.stderr.write('[bridge] ' + Array.prototype.join.call(arguments, ' ') + '\n') }

export function createBridge(port) {
  port = port || parseInt(process.env.CONDUCTOR_PORT) || 3055
  var wss = null
  var figmaClient = null
  var proxyConn = null
  var pending = new Map()
  var msgId = 1000
  var isOwner = false
  var isProxy = false

  function start() {
    return new Promise(function(resolve) {
      try {
        wss = new WebSocketServer({ port: port, host: '0.0.0.0' })
        wss.on('listening', function() {
          isOwner = true
          log('WebSocket server on port ' + port)
          resolve()
        })
        wss.on('connection', function(ws) {
          var role = null  // 'figma' or 'proxy'

          ws.on('message', function(rawData) {
            try {
              var msg = JSON.parse(rawData.toString())

              // Proxy identification
              if (msg._identify === 'proxy') {
                role = 'proxy'
                log('Proxy client identified')
                return
              }

              // Proxy forwarding a command to Figma
              if (msg._proxy && msg.command) {
                if (role !== 'proxy') { role = 'proxy'; log('Proxy client identified (via command)') }
                if (figmaClient && figmaClient.readyState === 1) {
                  pending.set(msg.id, { ws: ws, type: 'proxy' })
                  figmaClient.send(JSON.stringify({ id: msg.id, command: msg.command, data: msg.data }))
                } else {
                  ws.send(JSON.stringify({ id: msg.id, error: 'Figma plugin not connected' }))
                }
                return
              }

              // Response from Figma
              if (msg.id && pending.has(msg.id)) {
                var p = pending.get(msg.id)
                pending.delete(msg.id)
                if (p.type === 'proxy') {
                  // Route back to proxy
                  if (p.ws && p.ws.readyState === 1) p.ws.send(rawData.toString())
                } else if (p.type === 'local') {
                  clearTimeout(p.timer)
                  if (msg.error) p.reject(new Error(msg.error))
                  else p.resolve(msg.result)
                }
                return
              }

              // If we get here with a result/error, it's Figma responding
              if (!role) {
                role = 'figma'
                figmaClient = ws
                log('Figma plugin connected')
              }
            } catch (e) { log('Parse error:', e.message) }
          })

          ws.on('close', function() {
            if (role === 'figma') { figmaClient = null; log('Figma plugin disconnected') }
            if (role === 'proxy') { log('Proxy client disconnected') }
          })
          ws.on('error', function(e) { log('WS error:', e.message) })

          // Auto-identify as Figma if no message in 3s (Figma sends nothing on connect)
          setTimeout(function() {
            if (!role) {
              role = 'figma'
              figmaClient = ws
              log('Figma plugin connected (auto)')
            }
          }, 3000)
        })
        wss.on('error', function(e) {
          if (e.code === 'EADDRINUSE') {
            log('Port ' + port + ' in use — connecting as proxy')
            wss = null
            connectAsProxy(resolve)
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

  function connectAsProxy(resolve) {
    try {
      proxyConn = new WebSocket('ws://127.0.0.1:' + port)
      proxyConn.on('open', function() {
        isProxy = true
        // Identify ourselves immediately so server doesn't think we're Figma
        proxyConn.send(JSON.stringify({ _identify: 'proxy' }))
        log('Proxy connected to server on port ' + port)
        resolve()
      })
      proxyConn.on('message', function(data) {
        try {
          var msg = JSON.parse(data.toString())
          if (msg.id && pending.has(msg.id)) {
            var p = pending.get(msg.id)
            clearTimeout(p.timer)
            pending.delete(msg.id)
            if (msg.error) p.reject(new Error(msg.error))
            else p.resolve(msg.result)
          }
        } catch (e) { log('Proxy parse error:', e.message) }
      })
      proxyConn.on('close', function() { isProxy = false; proxyConn = null; log('Proxy disconnected') })
      proxyConn.on('error', function(e) { log('Proxy error:', e.message); isProxy = false; proxyConn = null; resolve() })
    } catch (e) { log('Proxy connect error:', e.message); resolve() }
  }

  function stop() {
    if (wss && isOwner) { wss.close(); wss = null }
    if (proxyConn) { proxyConn.close(); proxyConn = null }
  }

  function isConnected() {
    if (isOwner) return figmaClient !== null && figmaClient.readyState === 1
    if (isProxy) return proxyConn !== null && proxyConn.readyState === 1
    return false
  }

  function send(command, data, timeout) {
    timeout = timeout || 60000
    return new Promise(function(resolve, reject) {
      if (!isConnected()) return reject(new Error('Figma plugin not connected'))
      var id = ++msgId
      var timer = setTimeout(function() {
        pending.delete(id)
        reject(new Error('Timeout (' + timeout + 'ms)'))
      }, timeout)

      if (isOwner && figmaClient) {
        pending.set(id, { resolve: resolve, reject: reject, timer: timer, type: 'local' })
        figmaClient.send(JSON.stringify({ id: id, command: command, data: data }))
      } else if (isProxy && proxyConn) {
        pending.set(id, { resolve: resolve, reject: reject, timer: timer, type: 'local' })
        proxyConn.send(JSON.stringify({ id: id, command: command, data: data, _proxy: true }))
      }
    })
  }

  return { start: start, stop: stop, isConnected: isConnected, send: send, getPort: function() { return port } }
}
