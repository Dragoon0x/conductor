// ═══════════════════════════════════════════
// CONDUCTOR — Tool Registry
// ═══════════════════════════════════════════
// All 61 MCP tools, organized by category.
// Each tool has: name, description, category, inputSchema, handler reference.

export const CATEGORIES = {
  craft:        { label: 'Design Craft',   icon: '✦', count: 1 },
  create:       { label: 'Create',          icon: '⊞', count: 12 },
  layout:       { label: 'Layout',          icon: '▤', count: 7 },
  typography:   { label: 'Typography',      icon: '◆', count: 7 },
  color:        { label: 'Color & Style',   icon: '◑', count: 7 },
  components:   { label: 'Components',      icon: '◎', count: 6 },
  spacing:      { label: 'Spacing & Grid',  icon: '◧', count: 6 },
  audit:        { label: 'Audit & Critique', icon: '◉', count: 6 },
  accessibility:{ label: 'Accessibility',   icon: '♿', count: 5 },
  responsive:   { label: 'Responsive',      icon: '↔', count: 4 },
  export:       { label: 'Export & Handoff', icon: '⤓', count: 6 },
};

function str(desc) { return { type: 'string', description: desc }; }
function num(desc) { return { type: 'number', description: desc }; }
function bool(desc) { return { type: 'boolean', description: desc }; }
function arr(desc, items) { return { type: 'array', description: desc, items: items || { type: 'string' } }; }
function opt(schema) { return { ...schema, optional: true }; }

export const TOOLS = [
  // ═══ CREATE ═══
  { name: 'create_frame', category: 'create',
    description: 'Create an auto-layout frame with grid-aligned spacing, proper padding, and constraints.',
    inputSchema: { type: 'object', properties: { name: str('Frame name'), width: opt(num('Width')), height: opt(num('Height')), direction: opt(str('horizontal or vertical')), padding: opt(num('Padding (snapped to grid)')), gap: opt(num('Gap (snapped to grid)')), fill: opt(str('Background color hex')) }, required: ['name'] } },

  { name: 'create_page', category: 'create',
    description: 'Create a full page from intent: landing, pricing, dashboard, settings, auth. Generates proper section hierarchy with auto-layout.',
    inputSchema: { type: 'object', properties: { pageType: str('Page type: landing, pricing, dashboard, settings, auth, blog, portfolio, docs'), title: opt(str('Page title')), sections: opt(arr('Section types to include')), brandColor: opt(str('Primary brand color hex')), darkMode: opt(bool('Generate dark mode variant')) }, required: ['pageType'] } },

  { name: 'create_section', category: 'create',
    description: 'Create a page section: hero, features, testimonials, FAQ, CTA, pricing, stats, team. Pattern-aware with proper hierarchy.',
    inputSchema: { type: 'object', properties: { sectionType: str('Section type: hero, features, testimonials, faq, cta, pricing, stats, team, footer, header'), heading: opt(str('Section heading')), content: opt(str('Content description')), columns: opt(num('Number of columns for grid sections')) }, required: ['sectionType'] } },

  { name: 'create_card', category: 'create',
    description: 'Create a card with proper padding, radius, shadow depth, and content hierarchy.',
    inputSchema: { type: 'object', properties: { variant: opt(str('Card variant: default, elevated, outlined, filled')), title: opt(str('Card title')), description: opt(str('Card description')), hasImage: opt(bool('Include image placeholder')), hasAction: opt(bool('Include action button')), width: opt(num('Card width')) }, required: [] } },

  { name: 'create_form', category: 'create',
    description: 'Create a form layout with labels, inputs, validation states, help text, and submit flow.',
    inputSchema: { type: 'object', properties: { fields: arr('Field definitions', { type: 'object', properties: { name: str('Field name'), type: str('text, email, password, select, textarea, checkbox, radio'), label: str('Field label'), required: bool('Required field') } }), submitLabel: opt(str('Submit button text')), layout: opt(str('vertical or horizontal')) }, required: ['fields'] } },

  { name: 'create_table', category: 'create',
    description: 'Create a data table with header row, data rows, sorting indicators, and pagination controls.',
    inputSchema: { type: 'object', properties: { columns: arr('Column definitions', { type: 'object', properties: { name: str('Column name'), width: num('Column width') } }), rows: opt(num('Number of data rows')), hasPagination: opt(bool('Include pagination')), hasSorting: opt(bool('Include sort indicators')), hasCheckbox: opt(bool('Include row checkboxes')) }, required: ['columns'] } },

  { name: 'create_modal', category: 'create',
    description: 'Create a modal with overlay, header, content area, and action buttons. Proper sizing and constraints.',
    inputSchema: { type: 'object', properties: { title: str('Modal title'), size: opt(str('sm, md, lg, xl')), hasCloseButton: opt(bool('Include close button')), actions: opt(arr('Action button labels')) }, required: ['title'] } },

  { name: 'create_nav', category: 'create',
    description: 'Create navigation: topbar, sidebar, breadcrumbs, or tabs. Includes active states and responsive structure.',
    inputSchema: { type: 'object', properties: { navType: str('topbar, sidebar, breadcrumbs, tabs, bottom-nav'), items: arr('Navigation items'), logoText: opt(str('Logo text')), hasSearch: opt(bool('Include search')), hasAvatar: opt(bool('Include user avatar')) }, required: ['navType', 'items'] } },

  // ═══ LAYOUT ═══
  { name: 'layout_auto', category: 'layout',
    description: 'Convert any frame to auto-layout with inferred direction, gap, and padding. Removes absolute positioning.',
    inputSchema: { type: 'object', properties: { nodeId: str('Figma node ID to convert'), direction: opt(str('horizontal or vertical (auto-detected if omitted)')), gap: opt(num('Gap in px (auto-detected if omitted)')), padding: opt(num('Padding in px')) }, required: ['nodeId'] } },

  { name: 'layout_grid', category: 'layout',
    description: 'Apply a column grid to a frame: 12-col, 8-col, or custom with gutters and margins.',
    inputSchema: { type: 'object', properties: { nodeId: str('Figma node ID'), columns: opt(num('Number of columns (default 12)')), gutter: opt(num('Gutter width')), margin: opt(num('Outer margin')), type: opt(str('stretch, center, left, right')) }, required: ['nodeId'] } },

  { name: 'layout_stack', category: 'layout',
    description: 'Stack children vertically or horizontally with consistent grid-aligned spacing.',
    inputSchema: { type: 'object', properties: { nodeId: str('Parent node ID'), direction: str('horizontal or vertical'), gap: opt(num('Gap (snapped to grid)')), align: opt(str('start, center, end, stretch')) }, required: ['nodeId', 'direction'] } },

  { name: 'layout_wrap', category: 'layout',
    description: 'Create a wrap-layout for tag clouds, pill groups, or flexible card grids.',
    inputSchema: { type: 'object', properties: { nodeId: str('Parent node ID'), gap: opt(num('Gap between items')), maxWidth: opt(num('Max width before wrapping')) }, required: ['nodeId'] } },

  { name: 'layout_constrain', category: 'layout',
    description: 'Set responsive constraints on a frame: fill, hug, fixed, min/max width and height.',
    inputSchema: { type: 'object', properties: { nodeId: str('Node ID'), horizontal: opt(str('fill, hug, fixed')), vertical: opt(str('fill, hug, fixed')), minWidth: opt(num('Min width')), maxWidth: opt(num('Max width')), minHeight: opt(num('Min height')), maxHeight: opt(num('Max height')) }, required: ['nodeId'] } },

  { name: 'layout_align', category: 'layout',
    description: 'Align and distribute selected frames on the grid. Handles both alignment and even distribution.',
    inputSchema: { type: 'object', properties: { nodeIds: arr('Node IDs to align'), alignment: str('left, center, right, top, middle, bottom, distribute-h, distribute-v') }, required: ['nodeIds', 'alignment'] } },

  { name: 'layout_nest', category: 'layout',
    description: 'Restructure flat, absolute-positioned layers into a proper auto-layout tree based on spatial relationships.',
    inputSchema: { type: 'object', properties: { nodeId: str('Parent frame to restructure'), depth: opt(num('Max nesting depth (default 3)')) }, required: ['nodeId'] } },

  // ═══ TYPOGRAPHY ═══
  { name: 'type_scale', category: 'typography',
    description: 'Generate or detect a type scale. Supports minor third (1.2), major third (1.25), perfect fourth (1.333), and more.',
    inputSchema: { type: 'object', properties: { action: str('generate or detect'), baseSize: opt(num('Base font size (default 16)')), scaleRatio: opt(str('Scale name: minor-third, major-third, perfect-fourth, etc.')), nodeId: opt(str('Node ID to detect scale from')) }, required: ['action'] } },

  { name: 'type_hierarchy', category: 'typography',
    description: 'Set heading levels with proper size, weight, and line-height ratios across a frame.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to apply hierarchy to'), levels: opt(num('Number of heading levels (default 4)')), baseSize: opt(num('Body text size')) }, required: ['nodeId'] } },

  { name: 'type_pair', category: 'typography',
    description: 'Suggest font pairings from loaded fonts or recommend Google Fonts combinations.',
    inputSchema: { type: 'object', properties: { headingFont: opt(str('Heading font family')), bodyFont: opt(str('Body font family')), style: opt(str('modern, classic, technical, editorial, playful')) }, required: [] } },

  { name: 'type_measure', category: 'typography',
    description: 'Check line length (45-75 chars optimal), line-height ratios, and letter-spacing for readability.',
    inputSchema: { type: 'object', properties: { nodeId: str('Text node or frame to check') }, required: ['nodeId'] } },

  { name: 'type_apply', category: 'typography',
    description: 'Apply text styles consistently to all matching text elements across frames.',
    inputSchema: { type: 'object', properties: { nodeId: str('Root frame'), styles: { type: 'object', description: 'Text styles to apply by element type' } }, required: ['nodeId'] } },

  { name: 'type_audit', category: 'typography',
    description: 'Find every unique text style in a page. Flag off-scale sizes, inconsistent weights, and orphaned styles.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame or page to audit') }, required: ['nodeId'] } },

  // ═══ COLOR & STYLE ═══
  { name: 'color_palette', category: 'color',
    description: 'Generate a full color palette (50-950 shades) from a single brand color.',
    inputSchema: { type: 'object', properties: { baseColor: str('Brand color hex'), steps: opt(arr('Shade steps', { type: 'number' })) }, required: ['baseColor'] } },

  { name: 'color_semantic', category: 'color',
    description: 'Create semantic color tokens: surface, text, border, accent, danger, success, warning, info.',
    inputSchema: { type: 'object', properties: { brandColor: str('Primary brand color hex') }, required: ['brandColor'] } },

  { name: 'color_darkmode', category: 'color',
    description: 'Generate a dark mode variant of any frame or color set, preserving WCAG contrast ratios.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to generate dark mode for')), colors: opt({ type: 'object', description: 'Color map to invert' }) }, required: [] } },

  { name: 'color_contrast', category: 'color',
    description: 'Check WCAG contrast for all text/background pairs in a frame. Reports AA and AAA compliance.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to check')), foreground: opt(str('Foreground color hex')), background: opt(str('Background color hex')) }, required: [] } },

  { name: 'color_apply', category: 'color',
    description: 'Apply color styles to elements by semantic role: primary, secondary, muted, accent.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to apply colors to'), colorMap: { type: 'object', description: 'Role-to-color mapping' } }, required: ['nodeId'] } },

  { name: 'style_shadow', category: 'color',
    description: 'Generate an elevation/shadow system: sm, md, lg, xl, 2xl with consistent blur, spread, and opacity.',
    inputSchema: { type: 'object', properties: { levels: opt(arr('Shadow levels to generate')), color: opt(str('Shadow color hex')) }, required: [] } },

  { name: 'style_radius', category: 'color',
    description: 'Generate and apply a consistent border-radius scale across all frames.',
    inputSchema: { type: 'object', properties: { base: opt(num('Base radius (default 4)')), nodeId: opt(str('Frame to apply to')) }, required: [] } },

  // ═══ COMPONENTS ═══
  { name: 'component_list', category: 'components',
    description: 'List all components in the current file or team library, with variant info.',
    inputSchema: { type: 'object', properties: { source: opt(str('file or library')), filter: opt(str('Search filter')) }, required: [] } },

  { name: 'component_use', category: 'components',
    description: 'Instantiate a component by name with variant properties set.',
    inputSchema: { type: 'object', properties: { componentName: str('Component to instantiate'), variants: opt({ type: 'object', description: 'Variant property values' }), x: opt(num('X position')), y: opt(num('Y position')) }, required: ['componentName'] } },

  { name: 'component_create', category: 'components',
    description: 'Create a new component from a frame with proper variant structure.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to convert to component'), name: str('Component name'), variants: opt(arr('Variant property definitions')) }, required: ['nodeId', 'name'] } },

  { name: 'component_swap', category: 'components',
    description: 'Swap one component instance for another across an entire frame tree.',
    inputSchema: { type: 'object', properties: { nodeId: str('Root frame to search'), fromComponent: str('Component to replace'), toComponent: str('Component to replace with') }, required: ['nodeId', 'fromComponent', 'toComponent'] } },

  { name: 'component_detach', category: 'components',
    description: 'Detach component instances and flatten to editable frames.',
    inputSchema: { type: 'object', properties: { nodeId: str('Instance or frame to detach') }, required: ['nodeId'] } },

  { name: 'component_audit', category: 'components',
    description: 'Find detached instances, missing components, unused variants, and inconsistent overrides.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to audit (entire page if omitted)')) }, required: [] } },

  // ═══ SPACING & GRID ═══
  { name: 'spacing_scale', category: 'spacing',
    description: 'Define a base spacing unit (4px or 8px) and generate the full scale.',
    inputSchema: { type: 'object', properties: { base: opt(num('Base unit (default 8)')), steps: opt(num('Number of steps (default 12)')) }, required: [] } },

  { name: 'spacing_fix', category: 'spacing',
    description: 'Snap all off-grid spacing values in a frame to the nearest scale value.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to fix'), base: opt(num('Base unit (default 8)')) }, required: ['nodeId'] } },

  { name: 'spacing_audit', category: 'spacing',
    description: 'Report every spacing value in a frame: padding, margin, gap. Flag inconsistencies and off-grid values.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to audit'), base: opt(num('Base unit (default 8)')) }, required: ['nodeId'] } },

  { name: 'spacing_rhythm', category: 'spacing',
    description: 'Check vertical rhythm: are section gaps consistent and proportional? Flags irregular spacing patterns.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check') }, required: ['nodeId'] } },

  { name: 'grid_apply', category: 'spacing',
    description: 'Apply a layout grid to a frame: columns, rows, or custom grid with configurable gutter and margin.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to apply grid to'), type: str('columns, rows, grid'), count: opt(num('Column/row count')), gutter: opt(num('Gutter size')), margin: opt(num('Margin')) }, required: ['nodeId', 'type'] } },

  { name: 'grid_check', category: 'spacing',
    description: 'Verify all children of a frame align to the parent layout grid.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check') }, required: ['nodeId'] } },

  // ═══ AUDIT & CRITIQUE ═══
  { name: 'audit_full', category: 'audit',
    description: 'Full design audit: spacing, typography, color, components, accessibility, hierarchy. Returns a 0-100 score with per-category breakdown.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to audit (current page if omitted)')) }, required: [] } },

  { name: 'audit_hierarchy', category: 'audit',
    description: 'Check visual hierarchy: are primary elements dominant? Are heading levels properly differentiated?',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check') }, required: ['nodeId'] } },

  { name: 'audit_consistency', category: 'audit',
    description: 'Find elements that look similar but use different styles. Flags inconsistent text, colors, spacing, and radii.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check') }, required: ['nodeId'] } },

  { name: 'audit_alignment', category: 'audit',
    description: 'Flag misaligned elements, uneven margins, off-center content, and broken visual axes.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check'), tolerance: opt(num('Pixel tolerance (default 2)')) }, required: ['nodeId'] } },

  { name: 'audit_density', category: 'audit',
    description: 'Check information density: too cramped or too sparse? Measures whitespace ratio and content distribution.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check') }, required: ['nodeId'] } },

  { name: 'audit_score', category: 'audit',
    description: 'Generate a 0-100 design health score with per-category breakdown and actionable improvement suggestions.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to score')) }, required: [] } },

  // ═══ ACCESSIBILITY ═══
  { name: 'a11y_contrast', category: 'accessibility',
    description: 'Check all text/background color pairs against WCAG AA (4.5:1) and AAA (7:1) standards.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to check')), level: opt(str('aa or aaa (default aa)')) }, required: [] } },

  { name: 'a11y_touch', category: 'accessibility',
    description: 'Verify all interactive elements meet the 44x44px minimum touch target size.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check'), minSize: opt(num('Minimum size in px (default 44)')) }, required: ['nodeId'] } },

  { name: 'a11y_focus', category: 'accessibility',
    description: 'Generate focus ring styles for all interactive elements: buttons, inputs, links, toggles.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to add focus states to'), color: opt(str('Focus ring color hex')), offset: opt(num('Ring offset in px')) }, required: ['nodeId'] } },

  { name: 'a11y_labels', category: 'accessibility',
    description: 'Check for missing labels on inputs, buttons, and icon-only elements. Flags unlabeled interactive content.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check') }, required: ['nodeId'] } },

  { name: 'a11y_fix', category: 'accessibility',
    description: 'Auto-fix accessibility issues: bump insufficient contrast, enlarge small touch targets, add visible focus states.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to fix'), fixes: opt(arr('Specific fixes: contrast, touch, focus, labels')) }, required: ['nodeId'] } },

  // ═══ RESPONSIVE ═══
  { name: 'responsive_variant', category: 'responsive',
    description: 'Generate mobile (375px), tablet (768px), and desktop (1440px) variants of any frame.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to generate variants from'), breakpoints: opt(arr('Breakpoint widths', { type: 'number' })) }, required: ['nodeId'] } },

  { name: 'responsive_reflow', category: 'responsive',
    description: 'Reflow a desktop layout into mobile: stack columns, resize typography, adjust spacing.',
    inputSchema: { type: 'object', properties: { nodeId: str('Desktop frame to reflow'), targetWidth: num('Target width in px') }, required: ['nodeId', 'targetWidth'] } },

  { name: 'responsive_breakpoints', category: 'responsive',
    description: 'Set up breakpoint frames side by side: 375, 768, 1024, 1440. Ready for responsive design.',
    inputSchema: { type: 'object', properties: { widths: opt(arr('Breakpoint widths', { type: 'number' })), height: opt(num('Frame height')) }, required: [] } },

  { name: 'responsive_check', category: 'responsive',
    description: 'Verify text doesn\'t overflow, images maintain aspect ratio, and touch targets remain accessible at each breakpoint.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to check') }, required: ['nodeId'] } },

  // ═══ EXPORT & HANDOFF ═══
  { name: 'export_tokens_css', category: 'export',
    description: 'Export all design tokens as CSS custom properties.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to extract tokens from')), includeColors: opt(bool('Include colors')), includeSpacing: opt(bool('Include spacing')), includeTypography: opt(bool('Include typography')) }, required: [] } },

  { name: 'export_tokens_tailwind', category: 'export',
    description: 'Export tokens as a Tailwind CSS config theme extension.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to extract tokens from')) }, required: [] } },

  { name: 'export_tokens_json', category: 'export',
    description: 'Export tokens in W3C Design Tokens format (JSON).',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to extract tokens from')) }, required: [] } },

  { name: 'export_tokens_scss', category: 'export',
    description: 'Export tokens as SCSS variables and maps.',
    inputSchema: { type: 'object', properties: { nodeId: opt(str('Frame to extract tokens from')) }, required: [] } },

  { name: 'export_spec', category: 'export',
    description: 'Generate a design spec: measurements, spacing tokens, color values, component annotations.',
    inputSchema: { type: 'object', properties: { nodeId: str('Frame to generate spec for'), format: opt(str('markdown or json')) }, required: ['nodeId'] } },

  { name: 'export_changelog', category: 'export',
    description: 'Diff two frames and export what changed as structured markdown or JSON.',
    inputSchema: { type: 'object', properties: { nodeIdA: str('First frame (before)'), nodeIdB: str('Second frame (after)'), format: opt(str('markdown or json')) }, required: ['nodeIdA', 'nodeIdB'] } },

  // ═══ DESIGN CRAFT ═══
  { name: 'get_design_craft_guide', category: 'craft',
    description: 'IMPORTANT: Call this FIRST before creating any design. Returns comprehensive professional design rules covering typography scales, spacing systems, color palettes, component patterns, layout architecture, and anti-patterns. Read and follow these rules to produce production-quality designs.',
    inputSchema: { type: 'object', properties: {}, required: [] } },

  // ═══ CREATE (additional) ═══
  { name: 'create_ellipse', category: 'create',
    description: 'Create a circle or oval. Use for avatars, status indicators, decorative elements, and icon backgrounds. Set equal width and height for a perfect circle.',
    inputSchema: { type: 'object', properties: { name: opt(str('Element name')), width: num('Width in px'), height: num('Height in px'), fill: opt(str('Fill color hex')), x: opt(num('X position')), y: opt(num('Y position')), parentId: opt(str('Parent frame ID')), opacity: opt(num('Opacity 0-1')) }, required: ['width', 'height'] } },

  { name: 'create_line', category: 'create',
    description: 'Create a horizontal or vertical line. Use for dividers between sections, separators in navigation, and visual breaks. A line is a rectangle with 1px height (horizontal) or 1px width (vertical).',
    inputSchema: { type: 'object', properties: { name: opt(str('Element name')), length: num('Length in px'), direction: opt(str('horizontal or vertical (default horizontal)')), color: opt(str('Line color hex')), parentId: opt(str('Parent frame ID')) }, required: ['length'] } },

  { name: 'create_svg_node', category: 'create',
    description: 'Create a vector graphic from raw SVG markup. Use for icons, logos, illustrations, and any custom vector shape. Pass the SVG string directly.',
    inputSchema: { type: 'object', properties: { name: opt(str('Element name')), svg: str('Raw SVG markup string'), x: opt(num('X position')), y: opt(num('Y position')), parentId: opt(str('Parent frame ID')) }, required: ['svg'] } },

  { name: 'find_nodes', category: 'create',
    description: 'Search for elements by name or type within a frame or the entire page. Returns matching nodes with their IDs, positions, and basic properties. Use to locate elements before editing them.',
    inputSchema: { type: 'object', properties: { query: opt(str('Search by name (partial match)')), type: opt(str('Filter by type: FRAME, TEXT, RECTANGLE, ELLIPSE, COMPONENT, INSTANCE')), parentId: opt(str('Search within this frame only')) }, required: [] } },

  // ═══ TYPOGRAPHY (additional) ═══
  { name: 'style_text_range', category: 'typography',
    description: 'Apply different styles to specific character ranges within a text node. Use for mixed-weight text (e.g., bold product name within a regular sentence), colored keywords, or size variations within a single text element.',
    inputSchema: { type: 'object', properties: { nodeId: str('Text node ID'), start: num('Start character index'), end: num('End character index'), fontSize: opt(num('Font size for range')), fontWeight: opt(num('Font weight: 400, 500, 600, 700')), color: opt(str('Color hex for range')) }, required: ['nodeId', 'start', 'end'] } },
];

export function getToolsByCategory(category) {
  return TOOLS.filter(t => t.category === category);
}

export function getToolByName(name) {
  return TOOLS.find(t => t.name === name);
}

export function getAllToolNames() {
  return TOOLS.map(t => t.name);
}
