// ═══════════════════════════════════════════
// CONDUCTOR — Design Intelligence
// ═══════════════════════════════════════════
// Pure functions for design decisions. No Figma dependency.
// These encode the rules a senior designer applies instinctively.

// ─── 8px Grid ───

export const BASE_UNITS = [4, 8];

export function snapToGrid(value, base = 8) {
  return Math.round(value / base) * base;
}

export function isOnGrid(value, base = 8) {
  return value % base === 0;
}

export function generateSpacingScale(base = 8, steps = 12) {
  const scale = [];
  for (let i = 1; i <= steps; i++) {
    scale.push(base * i);
  }
  return scale;
}

export function findNearestGridValue(value, base = 8) {
  const snapped = snapToGrid(value, base);
  return { original: value, snapped, diff: Math.abs(value - snapped), onGrid: value === snapped };
}

export function auditSpacing(values, base = 8) {
  const results = values.map(v => findNearestGridValue(v, base));
  const onGrid = results.filter(r => r.onGrid).length;
  return {
    total: values.length,
    onGrid,
    offGrid: values.length - onGrid,
    adherence: values.length > 0 ? onGrid / values.length : 1,
    issues: results.filter(r => !r.onGrid),
    fixes: results.filter(r => !r.onGrid).map(r => ({ from: r.original, to: r.snapped })),
  };
}

// ─── Type Scale ───

export const TYPE_SCALES = {
  'minor-second':    { name: 'Minor Second',    ratio: 1.067 },
  'major-second':    { name: 'Major Second',    ratio: 1.125 },
  'minor-third':     { name: 'Minor Third',     ratio: 1.2 },
  'major-third':     { name: 'Major Third',     ratio: 1.25 },
  'perfect-fourth':  { name: 'Perfect Fourth',  ratio: 1.333 },
  'augmented-fourth':{ name: 'Augmented Fourth', ratio: 1.414 },
  'perfect-fifth':   { name: 'Perfect Fifth',   ratio: 1.5 },
  'golden-ratio':    { name: 'Golden Ratio',    ratio: 1.618 },
};

export function generateTypeScale(baseFontSize = 16, scaleKey = 'major-third', steps = { down: 2, up: 6 }) {
  const scale = TYPE_SCALES[scaleKey] || TYPE_SCALES['major-third'];
  const sizes = [];

  for (let i = -steps.down; i <= steps.up; i++) {
    const size = Math.round(baseFontSize * Math.pow(scale.ratio, i) * 100) / 100;
    const snapped = Math.round(size);
    sizes.push({ step: i, raw: size, size: snapped, label: getTypeLabel(i) });
  }

  return { scale: scale.name, ratio: scale.ratio, baseFontSize, sizes };
}

function getTypeLabel(step) {
  const labels = { '-2': 'xs', '-1': 'sm', 0: 'base', 1: 'md', 2: 'lg', 3: 'xl', 4: '2xl', 5: '3xl', 6: '4xl' };
  return labels[String(step)] || `step-${step}`;
}

export function detectTypeScale(fontSizes) {
  if (fontSizes.length < 3) return { detected: false, scale: null, ratio: null };
  const sorted = [...fontSizes].sort((a, b) => a - b);
  const ratios = [];
  for (let i = 1; i < sorted.length; i++) {
    ratios.push(sorted[i] / sorted[i - 1]);
  }
  const avgRatio = ratios.reduce((s, r) => s + r, 0) / ratios.length;

  let closest = null;
  let closestDist = Infinity;
  for (const [key, val] of Object.entries(TYPE_SCALES)) {
    const dist = Math.abs(avgRatio - val.ratio);
    if (dist < closestDist) { closestDist = dist; closest = { key, ...val }; }
  }

  return {
    detected: closestDist < 0.1,
    scale: closest,
    avgRatio: Math.round(avgRatio * 1000) / 1000,
    sizes: sorted,
  };
}

export function getLineHeight(fontSize) {
  if (fontSize <= 14) return 1.6;
  if (fontSize <= 20) return 1.5;
  if (fontSize <= 32) return 1.3;
  if (fontSize <= 48) return 1.15;
  return 1.1;
}

export function getFontWeight(level) {
  const weights = { heading: 700, subheading: 600, body: 400, caption: 400, label: 500 };
  return weights[level] || 400;
}

export function checkMeasure(charCount) {
  return { charCount, optimal: charCount >= 45 && charCount <= 75, tooNarrow: charCount < 45, tooWide: charCount > 75 };
}

// ─── Color ───

export function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return { r: parseInt(hex.substr(0,2),16), g: parseInt(hex.substr(2,2),16), b: parseInt(hex.substr(4,2),16) };
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rf = r/255, gf = g/255, bf = b/255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
    else if (max === gf) h = ((bf - rf) / d + 2) / 6;
    else h = ((rf - gf) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return rgbToHex(Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255));
}

export function generatePalette(baseHex, steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
  const { h, s } = hexToHsl(baseHex);
  return steps.map(step => {
    const l = step <= 50 ? 97 : step >= 950 ? 8 : Math.round(100 - (step / 10));
    const satAdj = step <= 100 || step >= 900 ? Math.max(0, s - 10) : s;
    return { step, hex: hslToHex(h, satAdj, l) };
  });
}

export function generateSemanticColors(brandHex) {
  const { h } = hexToHsl(brandHex);
  return {
    primary:   brandHex,
    surface:   hslToHex(h, 5, 98),
    surfaceAlt:hslToHex(h, 5, 95),
    border:    hslToHex(h, 8, 88),
    text:      hslToHex(h, 10, 15),
    textMuted: hslToHex(h, 6, 45),
    accent:    brandHex,
    success:   '#16a34a',
    warning:   '#d97706',
    danger:    '#dc2626',
    info:      '#2563eb',
  };
}

export function generateDarkMode(lightColors) {
  const result = {};
  for (const [key, hex] of Object.entries(lightColors)) {
    if (typeof hex !== 'string' || !hex.startsWith('#')) { result[key] = hex; continue; }
    const { h, s, l } = hexToHsl(hex);
    result[key] = hslToHex(h, Math.min(s, 80), 100 - l);
  }
  return result;
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrast(fgHex, bgHex) {
  const ratio = contrastRatio(fgHex, bgHex);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

// ─── Shadow / Elevation ───

export function generateElevation(steps = ['sm', 'md', 'lg', 'xl', '2xl']) {
  const configs = {
    sm:  { y: 1, blur: 2, spread: 0, opacity: 0.05 },
    md:  { y: 2, blur: 4, spread: -1, opacity: 0.06 },
    lg:  { y: 4, blur: 8, spread: -2, opacity: 0.08 },
    xl:  { y: 8, blur: 16, spread: -4, opacity: 0.1 },
    '2xl': { y: 16, blur: 32, spread: -8, opacity: 0.12 },
  };
  return steps.map(step => ({ step, ...configs[step], css: `0 ${configs[step].y}px ${configs[step].blur}px ${configs[step].spread}px rgba(0,0,0,${configs[step].opacity})` }));
}

// ─── Border Radius ───

export function generateRadiusScale(base = 4) {
  return [
    { name: 'none', value: 0 },
    { name: 'sm', value: base },
    { name: 'md', value: base * 2 },
    { name: 'lg', value: base * 3 },
    { name: 'xl', value: base * 4 },
    { name: '2xl', value: base * 6 },
    { name: 'full', value: 9999 },
  ];
}

// ─── Hierarchy ───

export function assessHierarchy(elements) {
  // elements: [{ type: 'heading'|'subheading'|'body'|'button'|'caption', fontSize, fontWeight, color }]
  const sorted = [...elements].sort((a, b) => {
    const weightA = (a.fontSize || 16) * (a.fontWeight || 400) / 400;
    const weightB = (b.fontSize || 16) * (b.fontWeight || 400) / 400;
    return weightB - weightA;
  });

  const issues = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];
    const currWeight = (curr.fontSize || 16) * (curr.fontWeight || 400) / 400;
    const nextWeight = (next.fontSize || 16) * (next.fontWeight || 400) / 400;
    if (currWeight / nextWeight < 1.1) {
      issues.push({ a: curr, b: next, reason: 'Insufficient visual weight difference between levels' });
    }
  }

  return { elements: sorted, issues, score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20) };
}

// ─── Accessibility ───

export function checkTouchTarget(width, height, minSize = 44) {
  return { width, height, passes: width >= minSize && height >= minSize, minSize };
}

// ─── Auto-Layout ───

export function inferLayoutDirection(children) {
  if (children.length < 2) return 'vertical';
  const firstTwo = children.slice(0, 2);
  const xDiff = Math.abs(firstTwo[0].x - firstTwo[1].x);
  const yDiff = Math.abs(firstTwo[0].y - firstTwo[1].y);
  return xDiff > yDiff ? 'horizontal' : 'vertical';
}

export function inferGap(children, direction = 'vertical') {
  if (children.length < 2) return 8;
  const gaps = [];
  const sorted = [...children].sort((a, b) => direction === 'vertical' ? a.y - b.y : a.x - b.x);
  for (let i = 1; i < sorted.length; i++) {
    const gap = direction === 'vertical'
      ? sorted[i].y - (sorted[i-1].y + sorted[i-1].height)
      : sorted[i].x - (sorted[i-1].x + sorted[i-1].width);
    if (gap > 0) gaps.push(gap);
  }
  if (gaps.length === 0) return 8;
  const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  return snapToGrid(avg);
}

export function inferPadding(parent, children) {
  if (children.length === 0) return { top: 16, right: 16, bottom: 16, left: 16 };
  const minX = Math.min(...children.map(c => c.x));
  const minY = Math.min(...children.map(c => c.y));
  const maxX = Math.max(...children.map(c => c.x + c.width));
  const maxY = Math.max(...children.map(c => c.y + c.height));
  return {
    top: snapToGrid(minY - parent.y),
    right: snapToGrid((parent.x + parent.width) - maxX),
    bottom: snapToGrid((parent.y + parent.height) - maxY),
    left: snapToGrid(minX - parent.x),
  };
}

// ─── Responsive ───

export const BREAKPOINTS = {
  mobile:  { name: 'Mobile',  width: 375, height: 812 },
  tablet:  { name: 'Tablet',  width: 768, height: 1024 },
  desktop: { name: 'Desktop', width: 1440, height: 900 },
};

export function scaleForBreakpoint(value, fromWidth, toWidth) {
  return Math.round(value * (toWidth / fromWidth));
}

// ─── Design Score ───

export function computeDesignScore(audit) {
  const weights = { spacing: 25, typography: 20, color: 15, components: 15, accessibility: 15, hierarchy: 10 };
  let total = 0;
  let maxTotal = 0;

  for (const [category, weight] of Object.entries(weights)) {
    const score = audit[category] ?? 100;
    total += score * weight;
    maxTotal += 100 * weight;
  }

  return Math.round((total / maxTotal) * 100);
}
