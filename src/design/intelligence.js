// ═══════════════════════════════════════════
// CONDUCTOR v3 — Design Intelligence Engine
// ═══════════════════════════════════════════
// This is what separates Conductor from every other Figma MCP.
// Every tool has design intelligence built in.

// ─── 8px Grid ───
export function snap(v, grid = 8) { return Math.round(v / grid) * grid }
export function snapUp(v, grid = 8) { return Math.ceil(v / grid) * grid }

// ─── Type Scale ───
const TYPE_SCALES = {
  minor2:    1.067, major2:    1.125, minor3:    1.200,
  major3:    1.250, perfect4:  1.333, aug4:      1.414,
  perfect5:  1.500, golden:    1.618,
}

export function typeScale(base = 16, ratio = 'major2', steps = 8) {
  const r = TYPE_SCALES[ratio] || parseFloat(ratio) || 1.125
  const scale = {}
  const names = ['xs','sm','base','md','lg','xl','2xl','3xl','4xl','5xl']
  for (let i = -2; i < steps; i++) {
    const size = Math.round(base * Math.pow(r, i))
    scale[names[i + 2] || `${i + 2}xl`] = size
  }
  return scale
}

// ─── Semantic Colors ───
export function semanticColors(brand = '#6366f1', mode = 'dark') {
  const hex2rgb = h => { const n = parseInt(h.replace('#',''), 16); return [(n>>16)&255,(n>>8)&255,n&255] }
  const rgb2hex = (r,g,b) => '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')
  const [br,bg,bb] = hex2rgb(brand)

  if (mode === 'dark') return {
    bg:       '#09090f', bg2:      '#0f0f1c', bg3:      '#14142a',
    surface:  '#12122a', surface2: '#16163a', surface3: '#1a1a42',
    border:   '#1e1e3a', border2:  '#282850', border3:  '#323268',
    text1:    '#f0f0f8', text2:    '#a0a0b8', text3:    '#686880',
    brand, brandDim: rgb2hex(Math.round(br*.3), Math.round(bg*.3), Math.round(bb*.3)),
    success: '#4ade80', warning: '#fbbf24', error: '#f87171', info: '#60a5fa',
  }
  return {
    bg:       '#ffffff', bg2:      '#f9f9fb', bg3:      '#f3f3f7',
    surface:  '#ffffff', surface2: '#f5f5fa', surface3: '#ededf5',
    border:   '#e4e4ec', border2:  '#d0d0dd', border3:  '#b8b8cc',
    text1:    '#111118', text2:    '#55556a', text3:    '#88889a',
    brand, brandDim: rgb2hex(Math.min(255,br+180), Math.min(255,bg+180), Math.min(255,bb+180)),
    success: '#16a34a', warning: '#d97706', error: '#dc2626', info: '#2563eb',
  }
}

// ─── Spacing System ───
export const SPACING = { none:0, xs:4, sm:8, md:16, lg:24, xl:32, '2xl':48, '3xl':64, '4xl':96 }

// ─── Corner Radius ───
export const RADIUS = { none:0, xs:4, sm:6, md:8, lg:12, xl:16, '2xl':20, '3xl':24, full:9999 }

// ─── Shadows ───
export const SHADOWS = {
  sm:   { color:'#00000015', offset:{x:0,y:1},  blur:3,  spread:0 },
  md:   { color:'#00000020', offset:{x:0,y:4},  blur:8,  spread:-2 },
  lg:   { color:'#00000025', offset:{x:0,y:8},  blur:24, spread:-4 },
  xl:   { color:'#00000030', offset:{x:0,y:20}, blur:48, spread:-8 },
}

// ─── Component Intelligence ───
// When an AI says "create a button", this knows what that means.
export function componentDefaults(type, variant = 'default') {
  const defs = {
    button: {
      default:  { h:44, px:20, py:0, radius:10, fontSize:15, fontWeight:'Semi Bold', minW:100, touchTarget:44 },
      sm:       { h:36, px:14, py:0, radius:8,  fontSize:13, fontWeight:'Medium',    minW:72,  touchTarget:44 },
      lg:       { h:52, px:28, py:0, radius:12, fontSize:17, fontWeight:'Semi Bold', minW:120, touchTarget:52 },
      icon:     { h:40, px:10, py:0, radius:10, fontSize:18, fontWeight:'Medium',    minW:40,  touchTarget:44 },
    },
    input: {
      default:  { h:44, px:14, py:0, radius:8,  fontSize:15, fontWeight:'Regular', borderW:1.5 },
      sm:       { h:36, px:12, py:0, radius:6,  fontSize:13, fontWeight:'Regular', borderW:1 },
      lg:       { h:52, px:16, py:0, radius:10, fontSize:17, fontWeight:'Regular', borderW:1.5 },
    },
    card: {
      default:  { px:24, py:24, radius:16, gap:16, borderW:1 },
      compact:  { px:16, py:16, radius:12, gap:12, borderW:1 },
      spacious: { px:32, py:32, radius:20, gap:20, borderW:1 },
    },
    avatar: {
      default:  { size:40, radius:9999, fontSize:16, fontWeight:'Semi Bold' },
      sm:       { size:32, radius:9999, fontSize:13, fontWeight:'Semi Bold' },
      lg:       { size:56, radius:9999, fontSize:22, fontWeight:'Semi Bold' },
    },
    badge: {
      default:  { h:24, px:10, py:0, radius:6, fontSize:11, fontWeight:'Semi Bold' },
      pill:     { h:24, px:10, py:0, radius:9999, fontSize:11, fontWeight:'Semi Bold' },
    },
    nav: {
      default:  { h:64, px:24, gap:24, fontSize:14, fontWeight:'Medium' },
      compact:  { h:52, px:16, gap:16, fontSize:13, fontWeight:'Medium' },
    },
    section: {
      default:  { py:96, px:48, gap:48, maxW:1120 },
      compact:  { py:64, px:32, gap:32, maxW:1120 },
      hero:     { py:120, px:48, gap:36, maxW:1120 },
    },
    modal: {
      default:  { px:28, py:28, radius:20, gap:20, maxW:480, borderW:1 },
      lg:       { px:36, py:36, radius:24, gap:24, maxW:640, borderW:1 },
    },
    sidebar: {
      default:  { w:260, px:16, py:20, gap:4, fontSize:14 },
      compact:  { w:220, px:12, py:16, gap:2, fontSize:13 },
      wide:     { w:300, px:20, py:24, gap:4, fontSize:14 },
    },
    toast: {
      default:  { h:48, px:16, py:0, radius:10, fontSize:14, fontWeight:'Medium', gap:10 },
    },
    tooltip: {
      default:  { px:10, py:6, radius:6, fontSize:12, fontWeight:'Medium' },
    },
    chip: {
      default:  { h:32, px:12, py:0, radius:8, fontSize:13, fontWeight:'Medium', gap:6 },
    },
    divider: {
      default:  { h:1, color:'border' },
    },
    skeleton: {
      default:  { radius:8, color:'surface2' },
    },
    progress: {
      default:  { h:8, radius:4 },
      thin:     { h:4, radius:2 },
    },
    switch: {
      default:  { w:44, h:24, radius:12, thumbSize:20, touchTarget:44 },
    },
    checkbox: {
      default:  { size:20, radius:4, borderW:2, touchTarget:44 },
    },
    radio: {
      default:  { size:20, radius:9999, borderW:2, touchTarget:44 },
    },
    table: {
      default:  { cellPx:16, cellPy:12, headerFontSize:12, bodyFontSize:14, headerWeight:'Semi Bold', borderW:1 },
    },
    tabs: {
      default:  { h:44, px:16, gap:4, fontSize:14, fontWeight:'Medium', indicatorH:2, indicatorRadius:1 },
    },
    dropdown: {
      default:  { itemH:40, px:12, py:8, radius:12, fontSize:14, gap:2, shadow:'lg' },
    },
  }
  const comp = defs[type]
  if (!comp) return null
  return comp[variant] || comp.default || null
}

// ─── Layout Intelligence ───
export function suggestAutoLayout(intent) {
  const layouts = {
    'row':      { direction:'HORIZONTAL', gap:snap(12), align:'CENTER' },
    'column':   { direction:'VERTICAL',   gap:snap(16), align:'STRETCH' },
    'center':   { direction:'VERTICAL',   gap:snap(16), align:'CENTER', justify:'CENTER' },
    'spread':   { direction:'HORIZONTAL', gap:0,         align:'CENTER', justify:'SPACE_BETWEEN' },
    'stack':    { direction:'VERTICAL',   gap:0,         align:'STRETCH' },
    'wrap':     { direction:'HORIZONTAL', gap:snap(12), align:'CENTER', wrap:true },
    'grid-2':   { direction:'HORIZONTAL', gap:snap(16), align:'STRETCH', childWidth:'FILL' },
    'grid-3':   { direction:'HORIZONTAL', gap:snap(16), align:'STRETCH', childWidth:'FILL' },
    'grid-4':   { direction:'HORIZONTAL', gap:snap(16), align:'STRETCH', childWidth:'FILL' },
    'sidebar':  { direction:'HORIZONTAL', gap:0,         align:'STRETCH' },
    'header':   { direction:'HORIZONTAL', gap:snap(16), align:'CENTER', px:snap(24) },
    'card-row': { direction:'HORIZONTAL', gap:snap(20), align:'STRETCH' },
    'form':     { direction:'VERTICAL',   gap:snap(16), align:'STRETCH' },
  }
  return layouts[intent] || layouts.column
}

// ─── Accessibility ───
export function checkContrast(fg, bg) {
  const hex2lum = h => {
    const [r,g,b] = [1,3,5].map(i => { let c = parseInt(h.slice(i,i+2),16)/255; return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4) })
    return 0.2126*r + 0.7152*g + 0.0722*b
  }
  const l1 = hex2lum(fg.replace('#',''))
  const l2 = hex2lum(bg.replace('#',''))
  const ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)
  return {
    ratio: Math.round(ratio*100)/100,
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3,
  }
}

export function auditAccessibility(node) {
  const issues = []
  // Touch target
  if (node.type === 'button' || node.type === 'input' || node.type === 'link') {
    if ((node.height || 0) < 44) issues.push({ severity:'error', rule:'touch-target', message:`Touch target ${node.height}px is below 44px minimum`, fix:{ height:44 } })
  }
  // Text contrast
  if (node.type === 'text' && node.color && node.bgColor) {
    const c = checkContrast(node.color, node.bgColor)
    if (!c.aa && (node.fontSize || 16) < 18) issues.push({ severity:'error', rule:'contrast-aa', message:`Contrast ratio ${c.ratio}:1 fails WCAG AA (needs 4.5:1)`, ratio:c.ratio })
    else if (!c.aaLarge && (node.fontSize || 16) >= 18) issues.push({ severity:'warning', rule:'contrast-aa-large', message:`Large text contrast ${c.ratio}:1 fails AA (needs 3:1)`, ratio:c.ratio })
  }
  // Font size
  if (node.type === 'text' && (node.fontSize || 16) < 12) {
    issues.push({ severity:'warning', rule:'min-font-size', message:`Font size ${node.fontSize}px is below 12px minimum`, fix:{ fontSize:12 } })
  }
  return issues
}

// ─── Font Weight Map ───
export const FONT_WEIGHTS = {
  '100':'Thin','200':'Extra Light','300':'Light','400':'Regular',
  '500':'Medium','600':'Semi Bold','700':'Bold','800':'Extra Bold','900':'Black',
  thin:'Thin', light:'Light', regular:'Regular', normal:'Regular',
  medium:'Medium', semibold:'Semi Bold', bold:'Bold', extrabold:'Extra Bold', black:'Black',
}

export function resolveFontWeight(w) {
  if (!w) return 'Regular'
  return FONT_WEIGHTS[String(w).toLowerCase()] || FONT_WEIGHTS[w] || w
}

// ─── Gradient Helpers ───
export function linearGradient(angle, stops) {
  const rad = (angle - 90) * Math.PI / 180
  return {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[Math.cos(rad), Math.sin(rad), 0.5 - 0.5*Math.cos(rad) - 0.5*Math.sin(rad)], [-Math.sin(rad), Math.cos(rad), 0.5 + 0.5*Math.sin(rad) - 0.5*Math.cos(rad)]],
    gradientStops: stops.map(s => ({ position: s.position, color: hexToFigmaColor(s.color) })),
  }
}

export function radialGradient(stops) {
  return {
    type: 'GRADIENT_RADIAL',
    gradientTransform: [[0.5,0,0.25],[0,0.5,0.25]],
    gradientStops: stops.map(s => ({ position: s.position, color: hexToFigmaColor(s.color) })),
  }
}

export function hexToFigmaColor(hex) {
  hex = hex.replace('#','')
  const hasAlpha = hex.length === 8
  const r = parseInt(hex.slice(0,2),16) / 255
  const g = parseInt(hex.slice(2,4),16) / 255
  const b = parseInt(hex.slice(4,6),16) / 255
  const a = hasAlpha ? parseInt(hex.slice(6,8),16) / 255 : 1
  return { r, g, b, a }
}

export function figmaColorToHex({r,g,b,a}) {
  const h = [r,g,b].map(v => Math.round(v*255).toString(16).padStart(2,'0')).join('')
  return a !== undefined && a < 1 ? '#' + h + Math.round(a*255).toString(16).padStart(2,'0') : '#' + h
}

// ─── Design Craft Guide ───
export function getDesignCraftGuide() {
  return {
    typography: {
      rules: [
        'Use 2-3 font weights maximum (Regular + Semi Bold, or Regular + Medium + Bold)',
        'Body text: 15-17px, line-height 1.5-1.7',
        'Headings: Use type scale ratios, not arbitrary sizes',
        'Never use font size below 12px',
        'Label/caption text: 11-13px, uppercase + letter-spacing for differentiation',
      ],
      scale: typeScale(16, 'major2'),
    },
    spacing: {
      rules: [
        'Use 8px grid for all spacing',
        'Content padding: 24-48px',
        'Card padding: 20-32px',
        'Section vertical padding: 64-120px',
        'Gap between related items: 8-16px',
        'Gap between groups: 24-48px',
      ],
      system: SPACING,
    },
    color: {
      rules: [
        'Maximum 3 brand colors',
        'Use opacity for hierarchy, not different grays',
        'Text hierarchy: 3 levels (primary, secondary, muted)',
        'Always check contrast ratios (WCAG AA minimum)',
        'Semantic colors for status: success/warning/error/info',
      ],
    },
    layout: {
      rules: [
        'Content max-width: 1120-1200px',
        'Use auto-layout for everything (no absolute positioning)',
        'Consistent alignment (CENTER for hero sections, LEFT for content)',
        'Visual hierarchy through size contrast, not just weight',
        'Generous whitespace signals quality',
      ],
    },
    components: {
      rules: [
        'Buttons: minimum 44px touch target',
        'Inputs: match button height for visual rhythm',
        'Cards: consistent padding and corner radius',
        'Icons: 20-24px for UI, 16-18px inline with text',
        'Avatars: always circular (border-radius: 9999)',
      ],
    },
    antiPatterns: [
      'Random font sizes not on a scale',
      'Spacing values not on 4/8px grid',
      'Too many colors competing for attention',
      'Tiny click targets on interactive elements',
      'Inconsistent corner radii across components',
      'Text on images without proper contrast overlay',
      'More than 3 font weights on one screen',
    ],
  }
}
