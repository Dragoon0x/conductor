// ═══════════════════════════════════════════
// CONDUCTOR v3 — Tool Handlers
// ═══════════════════════════════════════════

import {
  snap, typeScale, semanticColors, componentDefaults, suggestAutoLayout,
  checkContrast, auditAccessibility, getDesignCraftGuide, resolveFontWeight,
  hexToFigmaColor, linearGradient, radialGradient, SPACING, RADIUS, SHADOWS,
} from '../design/intelligence.js'

// ─── Icon SVG Library ───
const ICONS = {
  'arrow-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  'arrow-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  'arrow-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  'arrow-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
  'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  'plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  'minus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
  'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  'menu': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>',
  'star': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
  'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
  'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>',
  'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
  'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
  'chevron-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
  'chevron-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>',
  'external-link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>',
  'copy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
  'trash': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  'edit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  'download': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  'upload': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
  'eye': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  'lock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  'bell': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>',
  'filter': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>',
  'grid': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  'list': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
  'share': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  'sort': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></svg>',
  'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
  'calendar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  'phone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
}

// ─── Main Handler ───
export async function handleTool(name, args, bridge) {
  // Tools that don't need Figma connection
  switch (name) {
    case 'get_design_craft_guide': return getDesignCraftGuide()
    case 'check_contrast': return checkContrast(args.foreground, args.background)
    case 'suggest_color_palette': return semanticColors(args.brandColor, args.mode || 'dark')
    case 'suggest_type_scale': return typeScale(args.baseSize || 16, args.ratio || 'major2')
  }

  // Everything else needs Figma
  if (!bridge || !bridge.isConnected()) {
    throw new Error('Figma plugin not connected. Open Figma → Plugins → Development → Conductor, then try again.')
  }

  // Apply design intelligence to args before sending
  const enhanced = enhanceWithIntelligence(name, args)

  // Send to Figma plugin
  return bridge.send(name, enhanced)
}

// ─── Design Intelligence Enhancement ───
function enhanceWithIntelligence(name, args) {
  const a = { ...args }

  switch (name) {
    case 'create_frame': {
      // Snap all spacing to grid
      if (a.padding !== undefined) { const p = snap(a.padding); a.paddingTop = p; a.paddingRight = p; a.paddingBottom = p; a.paddingLeft = p; delete a.padding }
      if (a.paddingTop !== undefined) a.paddingTop = snap(a.paddingTop)
      if (a.paddingRight !== undefined) a.paddingRight = snap(a.paddingRight)
      if (a.paddingBottom !== undefined) a.paddingBottom = snap(a.paddingBottom)
      if (a.paddingLeft !== undefined) a.paddingLeft = snap(a.paddingLeft)
      if (a.gap !== undefined) a.gap = snap(a.gap)
      // Default auto-layout
      if (!a.direction) a.direction = 'VERTICAL'
      break
    }

    case 'create_text': {
      // Resolve font weight
      if (a.fontWeight) a.fontWeight = resolveFontWeight(a.fontWeight)
      if (!a.fontFamily) a.fontFamily = 'Inter'
      // Build fontName for Figma
      a.fontName = { family: a.fontFamily, style: a.fontWeight || 'Regular' }
      break
    }

    case 'create_smart_component': {
      const defaults = componentDefaults(a.type, a.variant)
      if (!defaults) throw new Error(`Unknown component type: ${a.type}. Available: button, input, card, avatar, badge, chip, switch, checkbox, radio, toast, tooltip, modal, dropdown, tabs, table, progress, skeleton, divider`)
      const colors = semanticColors(a.brandColor || '#6366f1', a.mode || 'dark')
      a._defaults = defaults
      a._colors = colors
      break
    }

    case 'set_effects': {
      if (a.preset) {
        const s = SHADOWS[a.preset]
        if (s) a.shadow = s
      }
      break
    }

    case 'set_fill': {
      if (a.type === 'LINEAR' && a.gradient) {
        a._fill = linearGradient(a.gradient.angle || 180, a.gradient.stops)
      } else if (a.type === 'RADIAL' && a.gradient) {
        a._fill = radialGradient(a.gradient.stops)
      } else if (a.color) {
        a._fill = { type: 'SOLID', color: hexToFigmaColor(a.color), opacity: a.opacity !== undefined ? a.opacity : 1 }
      }
      break
    }

    case 'create_icon': {
      const svg = ICONS[a.icon]
      if (!svg) throw new Error(`Unknown icon: ${a.icon}. Available: ${Object.keys(ICONS).join(', ')}`)
      a._svg = svg.replace('currentColor', a.color || '#ffffff')
      a._size = a.size || 24
      break
    }

    case 'set_auto_layout': {
      if (a.padding !== undefined) { const p = snap(a.padding); a.paddingTop = p; a.paddingRight = p; a.paddingBottom = p; a.paddingLeft = p; delete a.padding }
      ;['paddingTop','paddingRight','paddingBottom','paddingLeft','gap'].forEach(k => { if (a[k] !== undefined) a[k] = snap(a[k]) })
      break
    }

    case 'create_design_tokens': {
      const colors = semanticColors(a.brandColor, 'dark')
      const colorsLight = semanticColors(a.brandColor, 'light')
      const scale = typeScale(16, 'major2')
      a._darkColors = colors
      a._lightColors = colorsLight
      a._typeScale = scale
      a._spacing = SPACING
      a._radius = RADIUS
      break
    }

    case 'fix_spacing': {
      a._grid = a.grid || 8
      break
    }

    case 'lint_design': {
      a._rules = a.rules || ['spacing', 'naming', 'colors', 'fonts', 'contrast', 'alignment', 'touch-targets']
      break
    }
  }

  return a
}
