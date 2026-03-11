// ═══════════════════════════════════════════
// CONDUCTOR — Tests
// ═══════════════════════════════════════════

import {
  // Grid
  snapToGrid, isOnGrid, generateSpacingScale, auditSpacing,
  // Type
  TYPE_SCALES, generateTypeScale, detectTypeScale, getLineHeight, checkMeasure,
  // Color
  hexToRgb, rgbToHex, hexToHsl, hslToHex, generatePalette, generateSemanticColors,
  generateDarkMode, checkContrast, contrastRatio,
  // Shadow & Radius
  generateElevation, generateRadiusScale,
  // Hierarchy & A11y
  assessHierarchy, checkTouchTarget,
  // Layout
  inferLayoutDirection, inferGap, inferPadding, BREAKPOINTS,
  // Score
  computeDesignScore,
  // Registry
  TOOLS, CATEGORIES, getToolByName, getToolsByCategory, getAllToolNames,
  // Handlers
  handleTool,
  // Export
  exportCSS, exportTailwind, exportSCSS, exportJSON, exportW3CTokens,
} from '../src/index.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

function assertEq(a, b, msg) {
  assert(a === b, `${msg} (got: ${JSON.stringify(a)}, expected: ${JSON.stringify(b)})`);
}

// ─── Grid ────────────────────────────────

console.log('\n  Grid System');

assertEq(snapToGrid(13), 16, 'Snaps 13 to 16');
assertEq(snapToGrid(24), 24, '24 stays 24');
assertEq(snapToGrid(7), 8, 'Snaps 7 to 8');
assertEq(snapToGrid(0), 0, '0 stays 0');
assertEq(snapToGrid(5, 4), 4, 'Snaps 5 to 4 (4px grid)');
assert(isOnGrid(16), '16 is on 8px grid');
assert(!isOnGrid(13), '13 is not on 8px grid');
assert(isOnGrid(12, 4), '12 is on 4px grid');

const scale = generateSpacingScale(8, 6);
assertEq(scale.length, 6, 'Generates 6 spacing steps');
assertEq(scale[0], 8, 'First step is 8');
assertEq(scale[5], 48, 'Sixth step is 48');

const audit = auditSpacing([8, 13, 16, 22, 32], 8);
assertEq(audit.total, 5, 'Audit counts 5 values');
assertEq(audit.onGrid, 3, '3 on grid');
assertEq(audit.offGrid, 2, '2 off grid');
assert(audit.adherence === 0.6, 'Adherence is 60%');
assertEq(audit.fixes.length, 2, '2 fix suggestions');

// ─── Type Scale ──────────────────────────

console.log('\n  Type Scale');

assert(Object.keys(TYPE_SCALES).length >= 8, 'Has 8+ named scales');
assert(TYPE_SCALES['major-third'].ratio === 1.25, 'Major third ratio is 1.25');

const typeScale = generateTypeScale(16, 'major-third');
assert(typeScale.sizes.length > 0, 'Generates type sizes');
assert(typeScale.scale === 'Major Third', 'Scale name correct');
assertEq(typeScale.ratio, 1.25, 'Ratio is 1.25');
const baseSize = typeScale.sizes.find(s => s.step === 0);
assert(baseSize && baseSize.size === 16, 'Base size is 16px');

const detected = detectTypeScale([12, 16, 20, 25, 31]);
assert(detected.avgRatio > 1.1 && detected.avgRatio < 1.4, 'Detects reasonable ratio');

assert(getLineHeight(14) === 1.6, 'Small text gets 1.6 line-height');
assert(getLineHeight(24) === 1.3, 'Heading gets 1.3 line-height');
assert(getLineHeight(48) === 1.15, 'Display gets 1.15 line-height');

const measure = checkMeasure(60);
assert(measure.optimal, '60 chars is optimal');
assert(checkMeasure(30).tooNarrow, '30 chars is too narrow');
assert(checkMeasure(90).tooWide, '90 chars is too wide');

// ─── Color ───────────────────────────────

console.log('\n  Color System');

const rgb = hexToRgb('#ff6633');
assertEq(rgb.r, 255, 'Red channel correct');
assertEq(rgb.g, 102, 'Green channel correct');
assertEq(rgb.b, 51, 'Blue channel correct');

assertEq(rgbToHex(255, 102, 51), '#ff6633', 'RGB to hex roundtrip');

const hsl = hexToHsl('#ff0000');
assertEq(hsl.h, 0, 'Red hue is 0');
assertEq(hsl.s, 100, 'Red saturation is 100');
assertEq(hsl.l, 50, 'Red lightness is 50');

const palette = generatePalette('#6366f1');
assert(palette.length >= 10, 'Palette has 10+ shades');
assert(palette[0].step === 50, 'First shade is 50');
assert(palette[palette.length - 1].step === 950, 'Last shade is 950');
assert(palette.every(p => p.hex.startsWith('#')), 'All shades are valid hex');

const semantic = generateSemanticColors('#6366f1');
assert(semantic.primary === '#6366f1', 'Primary matches brand');
assert(semantic.surface.startsWith('#'), 'Surface is hex');
assert(semantic.danger === '#dc2626', 'Danger is red');

const dark = generateDarkMode({ bg: '#ffffff', text: '#111111' });
assert(dark.bg.startsWith('#'), 'Dark mode bg is hex');
assert(dark.text.startsWith('#'), 'Dark mode text is hex');

const contrast = checkContrast('#000000', '#ffffff');
assert(contrast.ratio === 21, 'Black on white is 21:1');
assert(contrast.aa, 'Passes AA');
assert(contrast.aaa, 'Passes AAA');

const lowContrast = checkContrast('#cccccc', '#ffffff');
assert(!lowContrast.aa, 'Light gray on white fails AA');

// ─── Shadow & Radius ─────────────────────

console.log('\n  Shadow & Radius');

const elevation = generateElevation();
assert(elevation.length === 5, '5 elevation levels');
assert(elevation[0].step === 'sm', 'First is sm');
assert(elevation[4].step === '2xl', 'Last is 2xl');
assert(elevation.every(e => e.css.startsWith('0 ')), 'All have CSS values');

const radii = generateRadiusScale(4);
assertEq(radii.length, 7, '7 radius steps');
assertEq(radii[0].value, 0, 'none is 0');
assertEq(radii[6].value, 9999, 'full is 9999');
assertEq(radii[1].value, 4, 'sm is 4');

// ─── Hierarchy ───────────────────────────

console.log('\n  Hierarchy');

const hierarchy = assessHierarchy([
  { type: 'heading', fontSize: 32, fontWeight: 700 },
  { type: 'subheading', fontSize: 24, fontWeight: 600 },
  { type: 'body', fontSize: 16, fontWeight: 400 },
]);
assert(hierarchy.issues.length === 0, 'Good hierarchy has no issues');
assertEq(hierarchy.score, 100, 'Good hierarchy scores 100');

const badHierarchy = assessHierarchy([
  { type: 'heading', fontSize: 16, fontWeight: 400 },
  { type: 'subheading', fontSize: 15, fontWeight: 400 },
]);
assert(badHierarchy.issues.length > 0, 'Flat hierarchy has issues');
assert(badHierarchy.score < 100, 'Flat hierarchy scores below 100');

// ─── Accessibility ───────────────────────

console.log('\n  Accessibility');

const goodTarget = checkTouchTarget(48, 48);
assert(goodTarget.passes, '48x48 passes touch target');

const badTarget = checkTouchTarget(32, 32);
assert(!badTarget.passes, '32x32 fails touch target');

// ─── Layout Inference ────────────────────

console.log('\n  Layout Inference');

const verticalChildren = [{ x: 10, y: 10, width: 100, height: 40 }, { x: 10, y: 60, width: 100, height: 40 }];
assertEq(inferLayoutDirection(verticalChildren), 'vertical', 'Detects vertical layout');

const horizontalChildren = [{ x: 10, y: 10, width: 100, height: 40 }, { x: 120, y: 10, width: 100, height: 40 }];
assertEq(inferLayoutDirection(horizontalChildren), 'horizontal', 'Detects horizontal layout');

const gap = inferGap([
  { x: 0, y: 0, width: 100, height: 40 },
  { x: 0, y: 56, width: 100, height: 40 },
], 'vertical');
assertEq(gap, 16, 'Infers 16px gap (snapped from actual 16)');

const padding = inferPadding(
  { x: 0, y: 0, width: 200, height: 100 },
  [{ x: 16, y: 16, width: 168, height: 68 }]
);
assertEq(padding.top, 16, 'Infers 16px top padding');
assertEq(padding.left, 16, 'Infers 16px left padding');

// ─── Design Score ────────────────────────

console.log('\n  Design Score');

const perfectScore = computeDesignScore({ spacing: 100, typography: 100, color: 100, components: 100, accessibility: 100, hierarchy: 100 });
assertEq(perfectScore, 100, 'Perfect audit = 100');

const mixedScore = computeDesignScore({ spacing: 80, typography: 60, color: 90, components: 70, accessibility: 50, hierarchy: 40 });
assert(mixedScore > 0 && mixedScore < 100, 'Mixed scores produce mid-range result');

// ─── Tool Registry ───────────────────────

console.log('\n  Tool Registry');

assertEq(TOOLS.length, 61, `Registry has 61 tools (got ${TOOLS.length})`);
assertEq(Object.keys(CATEGORIES).length, 10, '10 categories');

assert(getToolByName('create_frame') !== undefined, 'Can find create_frame');
assert(getToolByName('a11y_contrast') !== undefined, 'Can find a11y_contrast');
assert(getToolByName('nonexistent') === undefined, 'Returns undefined for missing tool');

const createTools = getToolsByCategory('create');
assertEq(createTools.length, 8, '8 create tools');

const allNames = getAllToolNames();
assertEq(allNames.length, 61, 'getAllToolNames returns 61');
assert(allNames.includes('layout_auto'), 'Names include layout_auto');

// Verify every tool has required fields
let toolsValid = true;
for (const t of TOOLS) {
  if (!t.name || !t.category || !t.description || !t.inputSchema) { toolsValid = false; break; }
}
assert(toolsValid, 'All tools have name, category, description, inputSchema');

// Verify categories match
for (const [key, cat] of Object.entries(CATEGORIES)) {
  const count = TOOLS.filter(t => t.category === key).length;
  assert(count === cat.count, `${key}: expected ${cat.count} tools, got ${count}`);
}

// ─── Tool Handlers ───────────────────────

console.log('\n  Tool Handlers');

const frameResult = handleTool('create_frame', { name: 'TestFrame', padding: 13, gap: 10 });
const frameData = JSON.parse(frameResult.content[0].text);
assertEq(frameData.itemSpacing, 8, 'Gap snapped to 8');
assertEq(frameData.paddingLeft, 16, 'Padding snapped to 16');

const paletteResult = handleTool('color_palette', { baseColor: '#6366f1' });
const paletteData = JSON.parse(paletteResult.content[0].text);
assert(paletteData.shades.length >= 10, 'Palette handler returns 10+ shades');

const contrastResult = handleTool('color_contrast', { foreground: '#000', background: '#fff' });
const contrastData = JSON.parse(contrastResult.content[0].text);
assert(contrastData.aa === true, 'Contrast handler checks AA');

const scaleResult = handleTool('type_scale', { action: 'generate', baseSize: 16, scaleRatio: 'perfect-fourth' });
const scaleData = JSON.parse(scaleResult.content[0].text);
assert(scaleData.ratio === 1.333, 'Type scale handler uses correct ratio');

const spacingResult = handleTool('spacing_scale', { base: 8, steps: 6 });
const spacingData = JSON.parse(spacingResult.content[0].text);
assertEq(spacingData.scale.length, 6, 'Spacing handler returns 6 steps');

const shadowResult = handleTool('style_shadow', {});
const shadowData = JSON.parse(shadowResult.content[0].text);
assertEq(shadowData.shadows.length, 5, 'Shadow handler returns 5 levels');

const unknownResult = handleTool('nonexistent_tool', {});
assert(unknownResult.content[0].text.includes('Unknown tool'), 'Unknown tool returns error message');

const pageResult = handleTool('create_page', { pageType: 'landing' });
const pageData = JSON.parse(pageResult.content[0].text);
assert(pageData.sections.length > 0, 'Page handler returns sections');
assert(pageData.typeScale.length > 0, 'Page handler includes type scale');

const semanticResult = handleTool('color_semantic', { brandColor: '#e8590c' });
const semanticData = JSON.parse(semanticResult.content[0].text);
assert(semanticData.primary === '#e8590c', 'Semantic handler uses brand color');
assert(semanticData.surface.startsWith('#'), 'Semantic handler generates surface');

// ─── Token Export ────────────────────────

console.log('\n  Token Export');

const tokens = {
  colors: { primary: '#6366f1', surface: '#fafafa' },
  spacing: [8, 16, 24, 32],
  fontSizes: [{ size: 12 }, { size: 14 }, { size: 16 }],
  radii: [{ name: 'sm', value: 4 }, { name: 'md', value: 8 }],
  shadows: [{ step: 'sm', css: '0 1px 2px rgba(0,0,0,0.05)' }],
};

const css = exportCSS(tokens);
assert(css.includes(':root'), 'CSS has :root');
assert(css.includes('--color-primary'), 'CSS has color tokens');
assert(css.includes('--space-1'), 'CSS has spacing tokens');

const tailwind = exportTailwind(tokens);
assert(tailwind.includes('module.exports'), 'Tailwind has module.exports');
assert(tailwind.includes('"primary"'), 'Tailwind has color key');

const scss = exportSCSS(tokens);
assert(scss.includes('$color-primary'), 'SCSS has color variable');
assert(scss.includes('$space-1'), 'SCSS has spacing variable');

const w3c = exportW3CTokens(tokens);
const w3cData = JSON.parse(w3c);
assert(w3cData.color.primary.$type === 'color', 'W3C format has $type');

const jsonExport = exportJSON(tokens);
const jsonData = JSON.parse(jsonExport);
assert(jsonData.colors.primary === '#6366f1', 'JSON export preserves data');

// ─── Summary ─────────────────────────────

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
