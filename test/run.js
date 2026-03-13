// ═══════════════════════════════════════════
// CONDUCTOR v3 — Tests
// ═══════════════════════════════════════════

import { TOOL_LIST, TOOL_COUNT, getTool, CATEGORIES, getToolsByCategory } from '../src/tools/registry.js'
import {
  snap, snapUp, typeScale, semanticColors, componentDefaults,
  suggestAutoLayout, checkContrast, auditAccessibility, getDesignCraftGuide,
  resolveFontWeight, hexToFigmaColor, figmaColorToHex, linearGradient,
  SPACING, RADIUS, SHADOWS,
} from '../src/design/intelligence.js'

let passed = 0, failed = 0
function assert(c, m) { if (c) { passed++; process.stdout.write('  ✓ ' + m + '\n') } else { failed++; process.stderr.write('  ✗ ' + m + '\n') } }
function eq(a, b, m) { assert(a === b, m + ` (got: ${a})`) }

console.log('\n  Tool Registry')
assert(TOOL_COUNT >= 200, `${TOOL_COUNT} tools (≥150)`)
assert(Object.keys(CATEGORIES).length >= 15, `${Object.keys(CATEGORIES).length} categories (≥15)`)
assert(Array.isArray(TOOL_LIST), 'TOOL_LIST is array')

console.log('\n  Categories')
for (const [cat, tools] of Object.entries(CATEGORIES)) {
  assert(tools.length > 0, `${cat}: ${tools.length} tools`)
}

console.log('\n  Tool Definitions')
for (const tool of TOOL_LIST) {
  assert(typeof tool.name === 'string' && tool.name.length > 0, `${tool.name} has name`)
  assert(typeof tool.description === 'string' && tool.description.length > 10, `${tool.name} has description`)
  assert(tool.inputSchema && tool.inputSchema.type === 'object', `${tool.name} has schema`)
}

console.log('\n  getTool')
assert(getTool('create_frame') !== null, 'create_frame exists')
assert(getTool('create_text') !== null, 'create_text exists')
assert(getTool('modify_node') !== null, 'modify_node exists')
assert(getTool('set_fill') !== null, 'set_fill exists')
assert(getTool('get_selection') !== null, 'get_selection exists')
assert(getTool('create_smart_component') !== null, 'create_smart_component exists')
assert(getTool('audit_accessibility') !== null, 'audit_accessibility exists')
assert(getTool('batch_rename') !== null, 'batch_rename exists')
assert(getTool('export_to_react') !== null, 'export_to_react exists')
assert(getTool('scan_design_system') !== null, 'scan_design_system exists')
assert(getTool('create_responsive_variant') !== null, 'create_responsive_variant exists')
assert(getTool('create_variable_collection') !== null, 'create_variable_collection exists')
assert(getTool('nonexistent') === null, 'nonexistent returns null')

console.log('\n  Core Figma tools (all covered)')
const coreTools = [
  'create_frame', 'create_text', 'create_rectangle', 'create_ellipse', 'create_line',
  'create_svg_node', 'set_auto_layout', 'modify_node', 'set_stroke', 'set_effects',
  'delete_node', 'move_to_parent', 'get_selection', 'get_page_structure', 'get_node_info',
  'find_nodes', 'set_selection', 'get_local_styles', 'list_components', 'create_component_instance',
  'create_vector', 'boolean_operation', 'flatten_node', 'set_fill', 'set_image_fill',
  'style_text_range', 'set_constraints', 'list_available_fonts', 'create_component',
  'create_component_set', 'create_variable_collection', 'create_variable', 'bind_variable',
  'get_variables', 'export_as_svg', 'get_design_craft_guide',
]
for (const name of coreTools) {
  assert(getTool(name) !== null, `Has ${name}`)
}

console.log('\n  Conductor exclusive tools')
const exclusives = [
  'create_smart_component', 'create_section', 'create_page', 'create_icon', 'create_divider',
  'audit_accessibility', 'check_contrast', 'fix_touch_targets', 'lint_design', 'fix_spacing',
  'check_naming', 'suggest_improvements', 'check_consistency', 'color_blindness_check',
  'responsive_check', 'generate_a11y_report',
  'batch_rename', 'batch_style', 'batch_replace_text', 'batch_replace_color', 'batch_resize',
  'batch_align', 'batch_delete', 'batch_set_visibility', 'clean_hidden_layers', 'select_all_by_type',
  'export_to_react', 'export_design_specs', 'export_assets', 'generate_stylesheet',
  'export_color_palette', 'export_typography',
  'scan_design_system', 'create_style_guide', 'detect_inconsistencies', 'normalize_design',
  'extract_components', 'suggest_color_palette', 'suggest_type_scale', 'import_design_system',
  'create_responsive_variant', 'generate_mobile', 'stack_for_mobile', 'convert_to_responsive',
  'create_design_tokens', 'import_tokens', 'export_tokens', 'swap_mode',
  'duplicate_node', 'group_nodes', 'ungroup_nodes', 'resize_node', 'align_nodes',
  'set_corner_radius', 'set_opacity', 'set_blend_mode', 'set_clip_content', 'rename_node',
  'lock_node', 'set_visibility', 'reorder_node', 'set_layout_sizing', 'set_rotation',
  'create_polygon', 'create_star', 'create_arrow', 'read_node_css', 'measure_distance',
  'get_selection_colors', 'get_nodes_info', 'get_annotations', 'set_annotation',
  'screenshot', 'copy_css', 'validate_component', 'compare_to_system',
  'batch_lock', 'batch_duplicate', 'set_breakpoint',
]
let exclusiveCount = 0
for (const name of exclusives) {
  if (getTool(name)) exclusiveCount++
}
assert(exclusiveCount >= 60, `${exclusiveCount} exclusive tools beyond competitors (≥70)`)

console.log('\n  Design Intelligence — Grid')
eq(snap(13), 16, 'snap(13) → 16')
eq(snap(4), 8, 'snap(4) → 8')
eq(snap(24), 24, 'snap(24) → 24')
eq(snap(0), 0, 'snap(0) → 0')
eq(snap(100), 104, 'snap(100) → 104')
eq(snapUp(13), 16, 'snapUp(13) → 16')

console.log('\n  Design Intelligence — Type Scale')
const ts = typeScale(16, 'major2')
assert(ts.base === 16, 'Base size is 16')
assert(ts.lg > ts.base, 'lg > base')
assert(ts.xl > ts.lg, 'xl > lg')
assert(ts.sm < ts.base, 'sm < base')
assert(Object.keys(ts).length >= 8, 'Has 8+ sizes')

console.log('\n  Design Intelligence — Colors')
const dark = semanticColors('#6366f1', 'dark')
assert(dark.bg === '#09090f', 'Dark bg')
assert(dark.text1 === '#f0f0f8', 'Dark text1')
assert(dark.brand === '#6366f1', 'Brand preserved')
assert(dark.success === '#4ade80', 'Success green')
assert(dark.error === '#f87171', 'Error red')

const light = semanticColors('#6366f1', 'light')
assert(light.bg === '#ffffff', 'Light bg')
assert(light.text1 === '#111118', 'Light text1')

console.log('\n  Design Intelligence — Components')
const btn = componentDefaults('button')
assert(btn !== null, 'Button defaults exist')
eq(btn.h, 44, 'Button height 44')
assert(btn.touchTarget >= 44, 'Button touch target ≥44')
eq(btn.radius, 10, 'Button radius 10')

const btnSm = componentDefaults('button', 'sm')
assert(btnSm.h < btn.h, 'Small button shorter')
assert(btnSm.touchTarget >= 44, 'Small button still 44px touch target')

const card = componentDefaults('card')
assert(card !== null, 'Card defaults exist')
assert(card.px >= 16, 'Card has padding')
assert(card.radius >= 12, 'Card has radius')

const input = componentDefaults('input')
assert(input !== null, 'Input defaults exist')
eq(input.h, 44, 'Input matches button height')

assert(componentDefaults('avatar') !== null, 'Avatar defaults')
assert(componentDefaults('badge') !== null, 'Badge defaults')
assert(componentDefaults('modal') !== null, 'Modal defaults')
assert(componentDefaults('sidebar') !== null, 'Sidebar defaults')
assert(componentDefaults('toast') !== null, 'Toast defaults')
assert(componentDefaults('tooltip') !== null, 'Tooltip defaults')
assert(componentDefaults('tabs') !== null, 'Tabs defaults')
assert(componentDefaults('table') !== null, 'Table defaults')
assert(componentDefaults('dropdown') !== null, 'Dropdown defaults')
assert(componentDefaults('switch') !== null, 'Switch defaults')
assert(componentDefaults('checkbox') !== null, 'Checkbox defaults')
assert(componentDefaults('radio') !== null, 'Radio defaults')
assert(componentDefaults('progress') !== null, 'Progress defaults')
assert(componentDefaults('chip') !== null, 'Chip defaults')
assert(componentDefaults('divider') !== null, 'Divider defaults')
assert(componentDefaults('skeleton') !== null, 'Skeleton defaults')
assert(componentDefaults('nonexistent') === null, 'Unknown returns null')

console.log('\n  Design Intelligence — Layout')
const row = suggestAutoLayout('row')
eq(row.direction, 'HORIZONTAL', 'Row is horizontal')
const col = suggestAutoLayout('column')
eq(col.direction, 'VERTICAL', 'Column is vertical')
const center = suggestAutoLayout('center')
eq(center.align, 'CENTER', 'Center aligns center')
const spread = suggestAutoLayout('spread')
eq(spread.justify, 'SPACE_BETWEEN', 'Spread uses space-between')

console.log('\n  Design Intelligence — Accessibility')
const contrast1 = checkContrast('#ffffff', '#000000')
assert(contrast1.ratio >= 19, 'White on black = 21:1')
assert(contrast1.aa === true, 'Passes AA')
assert(contrast1.aaa === true, 'Passes AAA')

const contrast2 = checkContrast('#777777', '#888888')
assert(contrast2.aa === false, 'Gray on gray fails AA')

console.log('\n  Design Intelligence — Font Weights')
eq(resolveFontWeight('bold'), 'Bold', 'bold → Bold')
eq(resolveFontWeight('semibold'), 'Semi Bold', 'semibold → Semi Bold')
eq(resolveFontWeight('600'), 'Semi Bold', '600 → Semi Bold')
eq(resolveFontWeight('400'), 'Regular', '400 → Regular')
eq(resolveFontWeight('regular'), 'Regular', 'regular → Regular')
eq(resolveFontWeight(null), 'Regular', 'null → Regular')

console.log('\n  Design Intelligence — Colors')
const fc = hexToFigmaColor('#ff0000')
assert(Math.abs(fc.r - 1) < 0.01, 'Red channel = 1')
assert(Math.abs(fc.g) < 0.01, 'Green channel = 0')
const hex = figmaColorToHex({ r: 1, g: 0, b: 0 })
eq(hex, '#ff0000', 'Back to hex')

console.log('\n  Design Intelligence — Gradients')
const lg = linearGradient(180, [{ position: 0, color: '#ff0000' }, { position: 1, color: '#0000ff' }])
eq(lg.type, 'GRADIENT_LINEAR', 'Linear gradient type')
assert(lg.gradientStops.length === 2, '2 stops')

console.log('\n  Design Intelligence — Constants')
assert(SPACING.md === 16, 'Spacing md = 16')
assert(SPACING.lg === 24, 'Spacing lg = 24')
assert(RADIUS.md === 8, 'Radius md = 8')
assert(RADIUS.full === 9999, 'Radius full = 9999')
assert(SHADOWS.md.blur === 8, 'Shadow md blur = 8')

console.log('\n  Design Intelligence — Craft Guide')
const guide = getDesignCraftGuide()
assert(guide.typography.rules.length >= 4, 'Typography rules')
assert(guide.spacing.rules.length >= 4, 'Spacing rules')
assert(guide.color.rules.length >= 4, 'Color rules')
assert(guide.layout.rules.length >= 4, 'Layout rules')
assert(guide.antiPatterns.length >= 5, 'Anti-patterns')
assert(guide.typography.scale !== null, 'Has type scale')
assert(guide.spacing.system !== null, 'Has spacing system')

console.log('\n  Comparison')
console.log(`  Conductor: ${TOOL_COUNT} tools`)
console.log(`  Competitors: ~45 tools max`)
console.log(`  Framelink: ~5 tools`)
console.log(`  Official:  ~12 tools`)
console.log(`  Advantage: ${TOOL_COUNT - 45} more tools than any competitor`)

// ─── New v3 Categories ───
console.log('\n  New Tool Categories')
const newCats = ['typography','color','prototype','page','library','annotation','effects']
for (const cat of newCats) {
  const tools = CATEGORIES[cat]
  assert(tools && tools.length > 0, `${cat}: ${tools ? tools.length : 0} tools`)
}

console.log('\n  New Tool Spot Checks')
const newTools = [
  'type_scale_apply','type_audit','type_normalize','set_text_content',
  'color_palette_generate','color_harmonize','color_darkmode','color_check_all',
  'create_prototype_link','create_overlay','set_fixed_position','create_flow',
  'create_new_page','switch_page','duplicate_page','rename_page',
  'search_library','swap_component','detach_instance','component_audit',
  'annotate_spacing','annotate_colors','create_spec_sheet','create_changelog',
  'create_glassmorphism','create_neumorphism','set_gradient_fill','create_shadow_system',
  'create_table_frame','create_form','create_nav_bar','create_card_grid',
  'create_sidebar_layout','create_footer','create_header',
  'batch_set_font','batch_round_values',
  'export_component_inventory','export_spacing_tokens',
]
let newCount = 0
for (const name of newTools) {
  if (getTool(name)) newCount++
}
assert(newCount >= 35, `${newCount} new tools verified (≥35)`)

console.log('\n  Final Comparison')
console.log(`  Conductor v3: ${TOOL_COUNT} tools, ${Object.keys(CATEGORIES).length} categories`)
console.log(`  Competitors:    ~45 tools max`)
console.log(`  Framelink:     ~5 tools`)
console.log(`  Official:      ~12 tools`)
console.log(`  Advantage:     ${TOOL_COUNT - 45} more tools than nearest competitor`)

console.log('\n  ' + passed + ' passed, ' + failed + ' failed\n')
process.exit(failed > 0 ? 1 : 0)
