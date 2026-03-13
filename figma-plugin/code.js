// ═══════════════════════════════════════════
// CONDUCTOR v3 — Figma Plugin
// ═══════════════════════════════════════════

figma.showUI(__html__, { width: 320, height: 200, themeColors: true })

let ws = null
const PORT = 3055

function connect() {
  figma.ui.postMessage({ type: 'connect', port: PORT })
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'ws-message') {
    try {
      const { id, command, data } = msg.data
      const result = await executeCommand(command, data)
      figma.ui.postMessage({ type: 'ws-send', data: JSON.stringify({ id, result }) })
    } catch (e) {
      const { id } = msg.data
      figma.ui.postMessage({ type: 'ws-send', data: JSON.stringify({ id, error: e.message }) })
    }
  } else if (msg.type === 'connected') {
    figma.notify('✓ Conductor connected', { timeout: 2000 })
  } else if (msg.type === 'disconnected') {
    figma.notify('Conductor disconnected', { timeout: 2000 })
  }
}

connect()

// ─── Helpers ───
function hexToRGB(hex) {
  hex = hex.replace('#', '')
  const hasAlpha = hex.length === 8
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
    a: hasAlpha ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  }
}

function solidPaint(hex, opacity) {
  const c = hexToRGB(hex)
  return [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: opacity !== undefined ? opacity : c.a }]
}

function getNode(id) {
  if (!id) return null
  const resolved = id.startsWith('$') ? resolveRef(id) : id
  return figma.getNodeById(resolved)
}

const refMap = {}
function storeRef(idx, nodeId) { refMap['$' + idx] = nodeId }
function resolveRef(ref) {
  const match = ref.match(/^\$(\d+)\.id$/)
  return match ? refMap['$' + match[1]] : ref
}

async function loadFont(family, style) {
  try { await figma.loadFontAsync({ family: family || 'Inter', style: style || 'Regular' }) }
  catch (e) { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }) }
}

function serializeNode(node, depth) {
  if (!node || depth < 0) return null
  const base = { id: node.id, name: node.name, type: node.type }
  if (node.width !== undefined) { base.width = Math.round(node.width); base.height = Math.round(node.height) }
  if (node.x !== undefined) { base.x = Math.round(node.x); base.y = Math.round(node.y) }
  if ('children' in node && depth > 0) {
    base.children = node.children.map(c => serializeNode(c, depth - 1)).filter(Boolean)
  }
  if ('fills' in node && Array.isArray(node.fills)) {
    base.fills = node.fills.map(f => {
      if (f.type === 'SOLID') return { type: 'SOLID', color: rgbToHex(f.color), opacity: f.opacity }
      return { type: f.type }
    })
  }
  if (node.type === 'TEXT') {
    base.characters = node.characters
    base.fontSize = node.fontSize
  }
  return base
}

function rgbToHex(c) {
  return '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

function nodeInfo(node) {
  const info = serializeNode(node, 0)
  if ('layoutMode' in node) {
    info.layoutMode = node.layoutMode
    info.paddingTop = node.paddingTop; info.paddingRight = node.paddingRight
    info.paddingBottom = node.paddingBottom; info.paddingLeft = node.paddingLeft
    info.itemSpacing = node.itemSpacing
    info.primaryAxisAlignItems = node.primaryAxisAlignItems
    info.counterAxisAlignItems = node.counterAxisAlignItems
  }
  if ('cornerRadius' in node) info.cornerRadius = node.cornerRadius
  if ('opacity' in node) info.opacity = node.opacity
  if ('effects' in node) info.effects = node.effects
  if ('strokes' in node) info.strokes = node.strokes
  if ('constraints' in node) info.constraints = node.constraints
  if (node.type === 'TEXT') {
    info.fontName = node.fontName
    info.textAlignHorizontal = node.textAlignHorizontal
    info.lineHeight = node.lineHeight
    info.letterSpacing = node.letterSpacing
  }
  return info
}

// ═══ Command Router ═══
async function executeCommand(cmd, data) {
  switch (cmd) {
    // ─── CREATE ───
    case 'create_frame': {
      const frame = figma.createFrame()
      frame.name = data.name || 'Frame'
      if (data.width) frame.resize(data.width, data.height || data.width)
      frame.layoutMode = data.direction || 'VERTICAL'
      frame.primaryAxisSizingMode = data.primaryAxisSizingMode === 'FILL' ? 'FIXED' : (data.primaryAxisSizingMode || 'HUG')
      frame.counterAxisSizingMode = data.counterAxisSizingMode || 'HUG'
      if (data.paddingTop !== undefined) frame.paddingTop = data.paddingTop
      if (data.paddingRight !== undefined) frame.paddingRight = data.paddingRight
      if (data.paddingBottom !== undefined) frame.paddingBottom = data.paddingBottom
      if (data.paddingLeft !== undefined) frame.paddingLeft = data.paddingLeft
      if (data.gap !== undefined) frame.itemSpacing = data.gap
      if (data.fill) frame.fills = solidPaint(data.fill)
      if (data.cornerRadius) frame.cornerRadius = data.cornerRadius
      if (data.primaryAxisAlignItems) frame.primaryAxisAlignItems = data.primaryAxisAlignItems
      if (data.counterAxisAlignItems) frame.counterAxisAlignItems = data.counterAxisAlignItems
      if (data.x !== undefined) { frame.x = data.x; frame.y = data.y || 0 }
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(frame) }
      return { id: frame.id, name: frame.name, type: 'FRAME' }
    }

    case 'create_text': {
      const fn = data.fontName || { family: data.fontFamily || 'Inter', style: data.fontWeight || 'Regular' }
      await loadFont(fn.family, fn.style)
      const text = figma.createText()
      text.fontName = fn
      text.characters = (data.text || '').replace(/\\n/g, '\n')
      text.fontSize = data.fontSize || 16
      if (data.color) text.fills = solidPaint(data.color)
      if (data.textAlignHorizontal) text.textAlignHorizontal = data.textAlignHorizontal
      if (data.textAlignVertical) text.textAlignVertical = data.textAlignVertical
      if (data.lineHeight) {
        text.lineHeight = data.lineHeight > 5 ? { value: data.lineHeight, unit: 'PIXELS' } : { value: data.lineHeight * 100, unit: 'PERCENT' }
      }
      if (data.letterSpacing) text.letterSpacing = { value: data.letterSpacing, unit: 'PIXELS' }
      if (data.maxWidth) { text.textAutoResize = 'HEIGHT'; text.resize(data.maxWidth, text.height) }
      if (data.textCase) text.textCase = data.textCase
      if (data.textDecoration) text.textDecoration = data.textDecoration
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(text) }
      return { id: text.id, name: text.name, type: 'TEXT' }
    }

    case 'create_rectangle': {
      const rect = figma.createRectangle()
      rect.name = data.name || 'Rectangle'
      rect.resize(data.width, data.height)
      if (data.fill) rect.fills = solidPaint(data.fill)
      if (data.cornerRadius) rect.cornerRadius = data.cornerRadius
      if (data.opacity !== undefined) rect.opacity = data.opacity
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(rect) }
      return { id: rect.id, name: rect.name, type: 'RECTANGLE' }
    }

    case 'create_ellipse': {
      const el = figma.createEllipse()
      el.name = data.name || 'Ellipse'
      el.resize(data.width, data.height)
      if (data.fill) el.fills = solidPaint(data.fill)
      if (data.opacity !== undefined) el.opacity = data.opacity
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(el) }
      return { id: el.id, name: el.name, type: 'ELLIPSE' }
    }

    case 'create_line': {
      const line = figma.createLine()
      line.name = data.name || 'Line'
      line.resize(data.length || 100, 0)
      if (data.direction === 'VERTICAL') line.rotation = 90
      line.strokes = solidPaint(data.strokeColor || '#ffffff', 1)
      line.strokeWeight = data.strokeWeight || 1
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(line) }
      return { id: line.id, name: line.name, type: 'LINE' }
    }

    case 'create_svg_node': {
      const node = figma.createNodeFromSvg(data.svg)
      if (data.name) node.name = data.name
      if (data.width && data.height) node.resize(data.width, data.height)
      else if (data.width) { const scale = data.width / node.width; node.resize(data.width, node.height * scale) }
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(node) }
      return { id: node.id, name: node.name, type: node.type }
    }

    case 'create_icon': {
      const svg = data._svg
      const node = figma.createNodeFromSvg(svg)
      node.name = data.icon || 'Icon'
      node.resize(data._size, data._size)
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(node) }
      return { id: node.id, name: node.name, type: node.type }
    }

    case 'create_component': {
      let comp
      if (data.fromNodeId) {
        const source = getNode(data.fromNodeId)
        if (!source) throw new Error('Node not found: ' + data.fromNodeId)
        comp = figma.createComponentFromNode(source)
      } else {
        comp = figma.createComponent()
        if (data.width && data.height) comp.resize(data.width, data.height)
      }
      comp.name = data.name
      if (data.description) comp.description = data.description
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(comp) }
      return { id: comp.id, name: comp.name, type: 'COMPONENT' }
    }

    case 'create_component_instance': {
      const comp = getNode(data.componentId)
      if (!comp || comp.type !== 'COMPONENT') throw new Error('Not a component: ' + data.componentId)
      const inst = comp.createInstance()
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(inst) }
      return { id: inst.id, name: inst.name, type: 'INSTANCE' }
    }

    // ─── MODIFY ───
    case 'modify_node': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found: ' + data.nodeId)
      if (data.x !== undefined) node.x = data.x
      if (data.y !== undefined) node.y = data.y
      if (data.width !== undefined && data.height !== undefined) node.resize(data.width, data.height)
      if (data.name) node.name = data.name
      if (data.visible !== undefined) node.visible = data.visible
      if (data.locked !== undefined) node.locked = data.locked
      if (data.opacity !== undefined) node.opacity = data.opacity
      if (data.rotation !== undefined) node.rotation = data.rotation
      if (data.cornerRadius !== undefined && 'cornerRadius' in node) node.cornerRadius = data.cornerRadius
      if (data.fill && 'fills' in node) node.fills = solidPaint(data.fill)
      return { id: node.id, name: node.name, modified: true }
    }

    case 'set_fill': {
      const node = getNode(data.nodeId)
      if (!node || !('fills' in node)) throw new Error('Cannot set fill on: ' + data.nodeId)
      if (data._fill) {
        if (data._fill.type === 'SOLID') node.fills = [data._fill]
        else node.fills = [data._fill]
      } else if (data.color) {
        node.fills = solidPaint(data.color, data.opacity)
      }
      return { id: node.id, fill: 'set' }
    }

    case 'set_stroke': {
      const node = getNode(data.nodeId)
      if (!node || !('strokes' in node)) throw new Error('Cannot set stroke on: ' + data.nodeId)
      node.strokes = solidPaint(data.color || '#ffffff', data.opacity)
      node.strokeWeight = data.weight || 1
      if (data.align) node.strokeAlign = data.align
      if (data.dashPattern) node.dashPattern = data.dashPattern
      return { id: node.id, stroke: 'set' }
    }

    case 'set_effects': {
      const node = getNode(data.nodeId)
      if (!node || !('effects' in node)) throw new Error('Cannot set effects on: ' + data.nodeId)
      const effects = []
      if (data.shadow) {
        const s = data.shadow
        effects.push({
          type: 'DROP_SHADOW', visible: true,
          color: { ...hexToRGB(s.color || '#00000040'), a: 0.25 },
          offset: { x: s.offsetX || s.offset?.x || 0, y: s.offsetY || s.offset?.y || 4 },
          radius: s.blur || 8, spread: s.spread || 0,
        })
      }
      if (data.blur) effects.push({ type: 'LAYER_BLUR', visible: true, radius: data.blur })
      if (data.backgroundBlur) effects.push({ type: 'BACKGROUND_BLUR', visible: true, radius: data.backgroundBlur })
      node.effects = effects
      return { id: node.id, effects: effects.length }
    }

    case 'set_auto_layout': {
      const node = getNode(data.nodeId)
      if (!node || node.type !== 'FRAME') throw new Error('Not a frame: ' + data.nodeId)
      if (data.direction) node.layoutMode = data.direction
      if (data.paddingTop !== undefined) node.paddingTop = data.paddingTop
      if (data.paddingRight !== undefined) node.paddingRight = data.paddingRight
      if (data.paddingBottom !== undefined) node.paddingBottom = data.paddingBottom
      if (data.paddingLeft !== undefined) node.paddingLeft = data.paddingLeft
      if (data.gap !== undefined) node.itemSpacing = data.gap
      if (data.primaryAxisAlignItems) node.primaryAxisAlignItems = data.primaryAxisAlignItems
      if (data.counterAxisAlignItems) node.counterAxisAlignItems = data.counterAxisAlignItems
      if (data.primaryAxisSizingMode) node.primaryAxisSizingMode = data.primaryAxisSizingMode === 'FILL' ? 'FIXED' : data.primaryAxisSizingMode
      if (data.counterAxisSizingMode) node.counterAxisSizingMode = data.counterAxisSizingMode === 'FILL' ? 'FIXED' : data.counterAxisSizingMode
      return { id: node.id, layout: 'set' }
    }

    case 'delete_node': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      const name = node.name
      node.remove()
      return { deleted: name }
    }

    case 'move_to_parent': {
      const node = getNode(data.nodeId)
      const parent = getNode(data.parentId)
      if (!node || !parent) throw new Error('Node or parent not found')
      if ('appendChild' in parent) {
        if (data.index !== undefined) parent.insertChild(data.index, node)
        else parent.appendChild(node)
      }
      return { id: node.id, parent: parent.id }
    }

    case 'duplicate_node': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      const copies = []
      for (let i = 0; i < (data.count || 1); i++) {
        const copy = node.clone()
        if (data.offsetX || data.offsetY) { copy.x = node.x + (data.offsetX || 0) * (i + 1); copy.y = node.y + (data.offsetY || 0) * (i + 1) }
        copies.push({ id: copy.id, name: copy.name })
      }
      return { copies }
    }

    case 'rename_node': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      node.name = data.name
      return { id: node.id, name: data.name }
    }

    case 'set_visibility': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      node.visible = data.visible
      return { id: node.id, visible: data.visible }
    }

    case 'set_constraints': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      node.constraints = {
        horizontal: data.horizontal || node.constraints.horizontal,
        vertical: data.vertical || node.constraints.vertical,
      }
      return { id: node.id, constraints: node.constraints }
    }

    case 'resize_node': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      if (data.scale) { node.resize(node.width * data.scale, node.height * data.scale) }
      else { node.resize(data.width || node.width, data.height || node.height) }
      return { id: node.id, width: Math.round(node.width), height: Math.round(node.height) }
    }

    case 'set_corner_radius': {
      const node = getNode(data.nodeId)
      if (!node || !('cornerRadius' in node)) throw new Error('Cannot set radius')
      if (data.radius !== undefined) node.cornerRadius = data.radius
      if (data.topLeft !== undefined) { node.topLeftRadius = data.topLeft; node.topRightRadius = data.topRight || 0; node.bottomRightRadius = data.bottomRight || 0; node.bottomLeftRadius = data.bottomLeft || 0 }
      return { id: node.id, cornerRadius: node.cornerRadius }
    }

    case 'set_opacity': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      node.opacity = data.opacity
      return { id: node.id, opacity: data.opacity }
    }

    case 'set_rotation': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      node.rotation = data.angle
      return { id: node.id, rotation: data.angle }
    }

    case 'set_clip_content': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      node.clipsContent = data.clip
      return { id: node.id, clipsContent: data.clip }
    }

    case 'flatten_node': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      const flat = figma.flatten([node])
      return { id: flat.id, name: flat.name }
    }

    case 'set_layout_sizing': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      if (data.horizontal) node.layoutSizingHorizontal = data.horizontal
      if (data.vertical) node.layoutSizingVertical = data.vertical
      return { id: node.id }
    }

    case 'group_nodes': {
      const nodes = data.nodeIds.map(id => getNode(id)).filter(Boolean)
      if (nodes.length < 2) throw new Error('Need at least 2 nodes to group')
      const group = figma.group(nodes, nodes[0].parent)
      if (data.name) group.name = data.name
      return { id: group.id, name: group.name }
    }

    case 'ungroup_nodes': {
      const node = getNode(data.nodeId)
      if (!node || node.type !== 'GROUP') throw new Error('Not a group')
      const parent = node.parent
      const children = [...node.children]
      for (const child of children) parent.appendChild(child)
      node.remove()
      return { ungrouped: children.length }
    }

    // ─── VECTOR ───
    case 'boolean_operation': {
      const nodes = data.nodeIds.map(id => getNode(id)).filter(Boolean)
      if (nodes.length < 2) throw new Error('Need at least 2 nodes')
      const ops = { UNION: 'UNION', SUBTRACT: 'SUBTRACT', INTERSECT: 'INTERSECT', EXCLUDE: 'EXCLUDE' }
      const result = figma.union(nodes, nodes[0].parent) // Note: actual API varies
      return { id: result.id, operation: data.operation }
    }

    case 'create_divider': {
      const rect = figma.createRectangle()
      rect.name = data.name || 'Divider'
      if (data.direction === 'VERTICAL') rect.resize(data.thickness || 1, data.length || 100)
      else rect.resize(data.length || 100, data.thickness || 1)
      rect.fills = solidPaint(data.color || '#1e1e3a')
      if (data.parentId) { const p = getNode(data.parentId); if (p && 'appendChild' in p) p.appendChild(rect) }
      return { id: rect.id, name: rect.name }
    }

    // ─── READ ───
    case 'get_selection': {
      return figma.currentPage.selection.map(n => nodeInfo(n))
    }

    case 'get_page_structure': {
      const page = data.pageId ? figma.getNodeById(data.pageId) : figma.currentPage
      return serializeNode(page, data.depth || 3)
    }

    case 'get_node_info': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      return nodeInfo(node)
    }

    case 'get_nodes_info': {
      return data.nodeIds.map(id => { const n = getNode(id); return n ? nodeInfo(n) : null }).filter(Boolean)
    }

    case 'find_nodes': {
      const scope = data.withinId ? getNode(data.withinId) : figma.currentPage
      if (!scope) throw new Error('Scope not found')
      let results = scope.findAll ? scope.findAll(n => {
        if (data.type && n.type !== data.type) return false
        if (data.query && !n.name.toLowerCase().includes(data.query.toLowerCase())) return false
        return true
      }) : []
      return results.slice(0, 50).map(n => ({ id: n.id, name: n.name, type: n.type }))
    }

    case 'get_local_styles': {
      const paint = figma.getLocalPaintStyles().map(s => ({ id: s.id, name: s.name, type: 'PAINT' }))
      const text = figma.getLocalTextStyles().map(s => ({ id: s.id, name: s.name, type: 'TEXT', fontSize: s.fontSize }))
      const effect = figma.getLocalEffectStyles().map(s => ({ id: s.id, name: s.name, type: 'EFFECT' }))
      return { paint, text, effect, total: paint.length + text.length + effect.length }
    }

    case 'list_components': {
      const page = data.pageId ? figma.getNodeById(data.pageId) : figma.currentPage
      const comps = page.findAll(n => n.type === 'COMPONENT')
      return comps.map(c => ({ id: c.id, name: c.name, description: c.description || '' }))
    }

    case 'list_pages': {
      return figma.root.children.map(p => ({ id: p.id, name: p.name, childCount: p.children.length }))
    }

    case 'get_document_info': {
      return { name: figma.root.name, pages: figma.root.children.map(p => ({ id: p.id, name: p.name })) }
    }

    case 'set_selection': {
      const nodes = data.nodeIds.map(id => getNode(id)).filter(Boolean)
      figma.currentPage.selection = nodes
      if (data.zoomToFit !== false && nodes.length) figma.viewport.scrollAndZoomIntoView(nodes)
      return { selected: nodes.length }
    }

    case 'set_focus': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      figma.currentPage.selection = [node]
      figma.viewport.scrollAndZoomIntoView([node])
      return { focused: node.id }
    }

    case 'list_available_fonts': {
      const fonts = await figma.listAvailableFontsAsync()
      const families = [...new Set(fonts.map(f => f.fontName.family))].sort()
      return { count: families.length, families: families.slice(0, 100) }
    }

    case 'get_selection_colors': {
      const colors = new Set()
      for (const node of figma.currentPage.selection) {
        if ('fills' in node && Array.isArray(node.fills)) {
          node.fills.forEach(f => { if (f.type === 'SOLID') colors.add(rgbToHex(f.color)) })
        }
      }
      return [...colors]
    }

    case 'measure_distance': {
      const n1 = getNode(data.nodeId1), n2 = getNode(data.nodeId2)
      if (!n1 || !n2) throw new Error('Node not found')
      const dx = Math.abs(n1.absoluteTransform[0][2] - n2.absoluteTransform[0][2])
      const dy = Math.abs(n1.absoluteTransform[1][2] - n2.absoluteTransform[1][2])
      return { horizontal: Math.round(dx), vertical: Math.round(dy), diagonal: Math.round(Math.sqrt(dx*dx + dy*dy)) }
    }

    // ─── EXPORT ───
    case 'export_as_svg': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      const svg = await node.exportAsync({ format: 'SVG_STRING' })
      return { svg: typeof svg === 'string' ? svg : new TextDecoder().decode(svg) }
    }

    case 'export_as_png': {
      const node = getNode(data.nodeId)
      if (!node) throw new Error('Node not found')
      const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: data.scale || 2 } })
      return { size: bytes.byteLength, format: 'PNG', scale: data.scale || 2 }
    }

    case 'screenshot': {
      if (data.nodeId) {
        const node = getNode(data.nodeId)
        if (!node) throw new Error('Node not found')
        const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: data.scale || 2 } })
        return { size: bytes.byteLength }
      }
      return { message: 'Viewport screenshot not available in plugin API' }
    }

    // ─── VARIABLES ───
    case 'create_variable_collection': {
      const collection = figma.variables.createVariableCollection(data.name)
      if (data.modes && data.modes.length > 1) {
        for (let i = 1; i < data.modes.length; i++) collection.addMode(data.modes[i])
        collection.renameMode(collection.modes[0].modeId, data.modes[0])
      }
      return { id: collection.id, name: collection.name, modes: collection.modes }
    }

    case 'create_variable': {
      const coll = figma.variables.getVariableCollectionById(data.collectionId)
      if (!coll) throw new Error('Collection not found')
      const typeMap = { COLOR: 'COLOR', FLOAT: 'FLOAT', STRING: 'STRING', BOOLEAN: 'BOOLEAN' }
      const variable = figma.variables.createVariable(data.name, coll, typeMap[data.type] || 'STRING')
      // Set default value
      if (data.type === 'COLOR') variable.setValueForMode(coll.defaultModeId, hexToRGB(data.value))
      else if (data.type === 'FLOAT') variable.setValueForMode(coll.defaultModeId, parseFloat(data.value))
      else if (data.type === 'BOOLEAN') variable.setValueForMode(coll.defaultModeId, data.value === 'true')
      else variable.setValueForMode(coll.defaultModeId, data.value)
      return { id: variable.id, name: variable.name }
    }

    case 'get_variables': {
      const collections = figma.variables.getLocalVariableCollections()
      return collections.map(c => ({
        id: c.id, name: c.name, modes: c.modes,
        variables: c.variableIds.map(vid => {
          const v = figma.variables.getVariableById(vid)
          return v ? { id: v.id, name: v.name, type: v.resolvedType } : null
        }).filter(Boolean)
      }))
    }

    case 'bind_variable': {
      const node = getNode(data.nodeId)
      const variable = figma.variables.getVariableById(data.variableId)
      if (!node || !variable) throw new Error('Node or variable not found')
      node.setBoundVariable(data.property, variable)
      return { bound: true, property: data.property, variable: variable.name }
    }

    // ─── BATCH ───
    case 'batch_rename': {
      const results = []
      for (let i = 0; i < data.nodeIds.length; i++) {
        const node = getNode(data.nodeIds[i])
        if (!node) continue
        const name = data.pattern.replace('{n}', String((data.startNumber || 1) + i)).replace('{name}', node.name)
        node.name = name
        results.push({ id: node.id, name })
      }
      return { renamed: results.length, results }
    }

    case 'batch_style': {
      let count = 0
      for (const id of data.nodeIds) {
        const node = getNode(id)
        if (!node) continue
        if (data.changes.fill && 'fills' in node) node.fills = solidPaint(data.changes.fill)
        if (data.changes.opacity !== undefined) node.opacity = data.changes.opacity
        if (data.changes.cornerRadius !== undefined && 'cornerRadius' in node) node.cornerRadius = data.changes.cornerRadius
        count++
      }
      return { styled: count }
    }

    case 'batch_replace_text': {
      const scope = data.nodeId ? getNode(data.nodeId) : figma.currentPage
      const textNodes = scope.findAll(n => n.type === 'TEXT')
      let count = 0
      for (const node of textNodes) {
        if (node.characters.includes(data.find) || (!data.matchCase && node.characters.toLowerCase().includes(data.find.toLowerCase()))) {
          await loadFont(node.fontName.family, node.fontName.style)
          const regex = new RegExp(data.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), data.matchCase ? 'g' : 'gi')
          node.characters = node.characters.replace(regex, data.replace)
          count++
        }
      }
      return { replaced: count }
    }

    case 'batch_replace_color': {
      const scope = data.nodeId ? getNode(data.nodeId) : figma.currentPage
      const findRgb = hexToRGB(data.find)
      let count = 0
      scope.findAll(n => {
        if ('fills' in n && Array.isArray(n.fills)) {
          const newFills = n.fills.map(f => {
            if (f.type === 'SOLID' && Math.abs(f.color.r - findRgb.r) < 0.02 && Math.abs(f.color.g - findRgb.g) < 0.02 && Math.abs(f.color.b - findRgb.b) < 0.02) {
              count++
              return { ...f, color: hexToRGB(data.replace) }
            }
            return f
          })
          n.fills = newFills
        }
        return false
      })
      return { replaced: count }
    }

    case 'batch_delete': {
      let count = 0
      for (const id of data.nodeIds) {
        const node = getNode(id)
        if (node) { node.remove(); count++ }
      }
      return { deleted: count }
    }

    case 'batch_set_visibility': {
      for (const id of data.nodeIds) {
        const node = getNode(id)
        if (node) node.visible = data.visible
      }
      return { updated: data.nodeIds.length }
    }

    case 'select_all_by_type': {
      const scope = data.withinId ? getNode(data.withinId) : figma.currentPage
      const nodes = scope.findAll(n => n.type === data.type)
      figma.currentPage.selection = nodes
      return { selected: nodes.length }
    }

    case 'clean_hidden_layers': {
      const scope = getNode(data.nodeId)
      if (!scope) throw new Error('Node not found')
      const hidden = scope.findAll(n => !n.visible)
      if (data.dryRun) return { wouldDelete: hidden.length, nodes: hidden.map(n => ({ id: n.id, name: n.name })) }
      hidden.forEach(n => n.remove())
      return { deleted: hidden.length }
    }

    // ─── DESIGN SYSTEM (handled partially client-side) ───
    case 'scan_design_system': {
      const page = data.pageId ? figma.getNodeById(data.pageId) : figma.currentPage
      const colors = new Set(), fonts = new Set(), radii = new Set(), spacings = new Set()
      page.findAll(n => {
        if ('fills' in n && Array.isArray(n.fills)) n.fills.forEach(f => { if (f.type === 'SOLID') colors.add(rgbToHex(f.color)) })
        if (n.type === 'TEXT') fonts.add(n.fontName.family + ' ' + n.fontName.style)
        if ('cornerRadius' in n && typeof n.cornerRadius === 'number') radii.add(n.cornerRadius)
        if ('itemSpacing' in n) spacings.add(n.itemSpacing)
        if ('paddingTop' in n) { spacings.add(n.paddingTop); spacings.add(n.paddingRight); spacings.add(n.paddingBottom); spacings.add(n.paddingLeft) }
        return false
      })
      return {
        colors: [...colors].sort(),
        fonts: [...fonts].sort(),
        radii: [...radii].sort((a,b) => a-b),
        spacings: [...spacings].sort((a,b) => a-b),
      }
    }

    case 'detect_inconsistencies': {
      const scope = data.nodeId ? getNode(data.nodeId) : figma.currentPage
      const issues = []
      scope.findAll(n => {
        // Check spacing off grid
        if ('paddingTop' in n) {
          ;['paddingTop','paddingRight','paddingBottom','paddingLeft','itemSpacing'].forEach(prop => {
            if (n[prop] % 4 !== 0 && n[prop] !== 0) issues.push({ node: n.name, id: n.id, issue: `${prop} (${n[prop]}px) not on 4px grid` })
          })
        }
        // Check generic names
        if (/^(Frame|Group|Rectangle|Ellipse|Line)\s*\d*$/.test(n.name)) {
          issues.push({ node: n.name, id: n.id, issue: 'Generic layer name' })
        }
        return false
      })
      return { issues: issues.slice(0, 100), total: issues.length }
    }

    case 'check_naming': {
      const scope = getNode(data.nodeId) || figma.currentPage
      const bad = scope.findAll(n => /^(Frame|Group|Rectangle|Ellipse|Line|Vector|Text)\s*\d*$/.test(n.name))
      return { genericNames: bad.length, nodes: bad.slice(0, 50).map(n => ({ id: n.id, name: n.name, type: n.type })) }
    }

    default:
      throw new Error(`Unknown command: ${cmd}. Conductor v3 has 150+ tools — check the docs.`)
  }
}
