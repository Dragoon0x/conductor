// ═══════════════════════════════════════════
// CONDUCTOR — Public API
// ═══════════════════════════════════════════

export { startServer } from './server.js';
export { Relay } from './relay.js';
export { TOOLS, CATEGORIES, getToolByName, getToolsByCategory, getAllToolNames } from './tools/registry.js';
export { handleTool } from './tools/handlers.js';

export {
  // Grid
  snapToGrid, isOnGrid, generateSpacingScale, findNearestGridValue, auditSpacing,
  // Type
  TYPE_SCALES, generateTypeScale, detectTypeScale, getLineHeight, getFontWeight, checkMeasure,
  // Color
  hexToRgb, rgbToHex, hexToHsl, hslToHex, generatePalette, generateSemanticColors,
  generateDarkMode, relativeLuminance, contrastRatio, checkContrast,
  // Shadow & Radius
  generateElevation, generateRadiusScale,
  // Hierarchy
  assessHierarchy,
  // Accessibility
  checkTouchTarget,
  // Layout
  inferLayoutDirection, inferGap, inferPadding, BREAKPOINTS, scaleForBreakpoint,
  // Score
  computeDesignScore,
} from './design/intelligence.js';

export { exportCSS, exportTailwind, exportSCSS, exportJSON, exportW3CTokens } from './design/exporter.js';
