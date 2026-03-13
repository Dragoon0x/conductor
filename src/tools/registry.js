// ═══════════════════════════════════════════
// CONDUCTOR v3 — Tool Registry (150+ Tools)
// ═══════════════════════════════════════════

function tool(name, desc, params, category) {
  return { name, description: desc, inputSchema: { type: 'object', properties: params, required: Object.keys(params).filter(k => params[k]._required) }, category }
}
function req(type, desc) { return { type, description: desc, _required: true } }
function opt(type, desc, def) { return { type, description: desc + (def !== undefined ? ` (default: ${def})` : '') } }
function enm(values, desc, def) { return { type: 'string', enum: values, description: desc + (def ? ` (default: ${def})` : '') } }

// ═══ CREATE & LAYOUT (25) ═══
const CREATE = {
  create_frame: tool('create_frame', 'Create a frame (screen, section, card, container). Automatically applies auto-layout with design-intelligent defaults.', {
    name: req('string', 'Frame name (semantic: "Hero Section", "Card", "Sidebar")'),
    width: opt('number', 'Width in pixels. Omit for hug-contents.'),
    height: opt('number', 'Height in pixels. Omit for hug-contents.'),
    direction: enm(['VERTICAL','HORIZONTAL'], 'Layout direction', 'VERTICAL'),
    padding: opt('number', 'Equal padding all sides (8px grid snapped)'),
    paddingTop: opt('number', 'Top padding'), paddingRight: opt('number', 'Right padding'),
    paddingBottom: opt('number', 'Bottom padding'), paddingLeft: opt('number', 'Left padding'),
    gap: opt('number', 'Space between children (8px grid)'),
    fill: opt('string', 'Background color hex'),
    cornerRadius: opt('number', 'Corner radius'),
    primaryAxisAlignItems: enm(['MIN','CENTER','MAX','SPACE_BETWEEN'], 'Main axis alignment'),
    counterAxisAlignItems: enm(['MIN','CENTER','MAX','STRETCH'], 'Cross axis alignment'),
    primaryAxisSizingMode: enm(['FIXED','HUG','FILL'], 'Main axis sizing'),
    counterAxisSizingMode: enm(['FIXED','HUG','FILL'], 'Cross axis sizing'),
    parentId: opt('string', 'Parent node ID to nest inside'),
    x: opt('number', 'X position on canvas'), y: opt('number', 'Y position on canvas'),
  }, 'create'),

  create_text: tool('create_text', 'Create text with design-intelligent typography. Font weight is auto-resolved (e.g. "bold" → "Bold", "600" → "Semi Bold").', {
    text: req('string', 'Text content (use \\n for line breaks)'),
    fontSize: opt('number', 'Font size in px', 16),
    color: opt('string', 'Text color hex', '#ffffff'),
    fontFamily: opt('string', 'Font family', 'Inter'),
    fontWeight: opt('string', 'Weight: thin/light/regular/medium/semibold/bold/extrabold or 100-900', 'Regular'),
    textAlignHorizontal: enm(['LEFT','CENTER','RIGHT','JUSTIFIED'], 'Horizontal alignment'),
    textAlignVertical: enm(['TOP','CENTER','BOTTOM'], 'Vertical alignment'),
    lineHeight: opt('number', 'Line height in px or ratio (1.5 = 150%)'),
    letterSpacing: opt('number', 'Letter spacing in px'),
    textDecoration: enm(['NONE','UNDERLINE','STRIKETHROUGH'], 'Text decoration'),
    textCase: enm(['ORIGINAL','UPPER','LOWER','TITLE'], 'Text case transform'),
    maxWidth: opt('number', 'Maximum text width for wrapping'),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  create_rectangle: tool('create_rectangle', 'Create a rectangle shape.', {
    name: opt('string', 'Name', 'Rectangle'),
    width: req('number', 'Width'), height: req('number', 'Height'),
    fill: opt('string', 'Fill color hex'),
    cornerRadius: opt('number', 'Corner radius'), opacity: opt('number', 'Opacity 0-1'),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  create_ellipse: tool('create_ellipse', 'Create a circle or oval.', {
    name: opt('string', 'Name', 'Ellipse'),
    width: req('number', 'Width'), height: req('number', 'Height'),
    fill: opt('string', 'Fill color hex'), opacity: opt('number', 'Opacity 0-1'),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  create_line: tool('create_line', 'Create a line or divider.', {
    name: opt('string', 'Name', 'Line'),
    length: req('number', 'Line length'), direction: enm(['HORIZONTAL','VERTICAL'], 'Direction', 'HORIZONTAL'),
    strokeColor: opt('string', 'Stroke color'), strokeWeight: opt('number', 'Stroke weight', 1),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  create_svg_node: tool('create_svg_node', 'Create a vector graphic from SVG markup. Use for icons, logos, illustrations.', {
    svg: req('string', 'SVG markup string'),
    name: opt('string', 'Node name'),
    width: opt('number', 'Target width'), height: opt('number', 'Target height'),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  create_component: tool('create_component', 'Create a reusable component from the current selection or a new frame.', {
    name: req('string', 'Component name'),
    description: opt('string', 'Component description'),
    fromNodeId: opt('string', 'Node ID to convert to component'),
    width: opt('number', 'Width'), height: opt('number', 'Height'),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  create_component_instance: tool('create_component_instance', 'Instantiate an existing component.', {
    componentId: req('string', 'Component node ID to instantiate'),
    parentId: opt('string', 'Parent to place instance in'),
    overrides: opt('object', 'Property overrides: { "Text Label": "New text", "fill": "#ff0000" }'),
  }, 'create'),

  create_component_set: tool('create_component_set', 'Combine component variants into a variant set.', {
    name: req('string', 'Component set name'),
    componentIds: { type:'array', items:{type:'string'}, description:'Array of component IDs to combine', _required:true },
  }, 'create'),

  create_smart_component: tool('create_smart_component', 'Create a design-intelligent component with proper auto-layout, padding, and sizing. Uses component intelligence defaults.', {
    type: req('string', 'Component type: button, input, card, avatar, badge, chip, switch, checkbox, radio, toast, tooltip, modal, dropdown, tabs, table, progress, skeleton, divider'),
    variant: opt('string', 'Variant: default, sm, lg, icon, compact, spacious, pill, thin'),
    label: opt('string', 'Text label for the component'),
    brandColor: opt('string', 'Brand/accent color hex'),
    mode: enm(['dark','light'], 'Color mode', 'dark'),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  set_auto_layout: tool('set_auto_layout', 'Configure auto-layout on a frame. All spacing is 8px grid-snapped.', {
    nodeId: req('string', 'Target node ID'),
    direction: enm(['VERTICAL','HORIZONTAL'], 'Direction'),
    padding: opt('number', 'Uniform padding'),
    paddingTop: opt('number',''), paddingRight: opt('number',''), paddingBottom: opt('number',''), paddingLeft: opt('number',''),
    gap: opt('number', 'Gap between children'),
    primaryAxisAlignItems: enm(['MIN','CENTER','MAX','SPACE_BETWEEN'], 'Main axis'),
    counterAxisAlignItems: enm(['MIN','CENTER','MAX','STRETCH'], 'Cross axis'),
    primaryAxisSizingMode: enm(['FIXED','HUG','FILL'], 'Main sizing'),
    counterAxisSizingMode: enm(['FIXED','HUG','FILL'], 'Cross sizing'),
  }, 'create'),

  create_section: tool('create_section', 'Create a design-intelligent page section (hero, features, pricing, CTA, testimonials, FAQ, footer, stats, logos, comparison, team).', {
    type: req('string', 'Section type: hero, features, pricing, cta, testimonials, faq, footer, stats, logos, comparison, team, newsletter'),
    content: opt('object', 'Content data: { title, subtitle, items[], ... }'),
    brandColor: opt('string', 'Brand color hex'),
    mode: enm(['dark','light'], 'Color mode', 'dark'),
    width: opt('number', 'Frame width', 1440),
    parentId: opt('string', 'Parent node ID'),
  }, 'create'),

  create_page: tool('create_page', 'Create a complete page design with multiple sections. Design-intelligent layout, spacing, and typography throughout.', {
    type: req('string', 'Page type: landing, pricing, dashboard, settings, login, signup, profile, blog, docs, 404'),
    content: opt('object', 'Page content: { brand, title, features[], stats[], tiers[], ... }'),
    brandColor: opt('string', 'Brand color hex'),
    mode: enm(['dark','light'], 'Color mode', 'dark'),
    width: opt('number', 'Frame width', 1440),
  }, 'create'),

  create_table_frame: tool('create_table_frame', 'Create a data table with headers, rows, and proper spacing.', {
    columns: { type:'array', items:{type:'string'}, description:'Column headers', _required:true },
    rows: opt('array', 'Row data: arrays of cell values'),
    brandColor: opt('string', 'Accent color'),
    parentId: opt('string', 'Parent node'),
  }, 'create'),

  create_form: tool('create_form', 'Create a form layout with labeled inputs, validation states, and submit button.', {
    fields: { type:'array', items:{type:'object'}, description:'Fields: [{ label, type: "text|email|password|select|textarea", required }]', _required:true },
    submitLabel: opt('string', 'Submit button text', 'Submit'),
    brandColor: opt('string', 'Accent color'),
    parentId: opt('string', 'Parent node'),
  }, 'create'),

  create_nav_bar: tool('create_nav_bar', 'Create a navigation bar with logo, links, and CTA button.', {
    brand: opt('string', 'Brand name', 'acme'),
    items: opt('array', 'Nav items: ["Features", "Pricing", "Docs"]'),
    ctaText: opt('string', 'CTA button text'),
    width: opt('number', 'Width', 1440),
    brandColor: opt('string', 'Accent color'),
    parentId: opt('string', 'Parent node'),
  }, 'create'),

  create_card_grid: tool('create_card_grid', 'Create a grid of cards with proper spacing and alignment.', {
    columns: opt('number', 'Number of columns', 3),
    cards: opt('array', 'Card data: [{ title, description, icon }]'),
    brandColor: opt('string', 'Accent color'),
    parentId: opt('string', 'Parent node'),
  }, 'create'),

  create_sidebar_layout: tool('create_sidebar_layout', 'Create a sidebar + main content layout with proper proportions.', {
    sidebarWidth: opt('number', 'Sidebar width', 260),
    totalWidth: opt('number', 'Total width', 1440),
    brandColor: opt('string', 'Accent color'),
    parentId: opt('string', 'Parent node'),
  }, 'create'),

  create_footer: tool('create_footer', 'Create a page footer with columns, links, and copyright.', {
    brand: opt('string', 'Brand name'),
    columns: opt('array', 'Footer columns: [{ title, links: ["Link 1", "Link 2"] }]'),
    width: opt('number', 'Width', 1440),
    brandColor: opt('string', 'Accent color'),
    parentId: opt('string', 'Parent node'),
  }, 'create'),

  create_header: tool('create_header', 'Create a page header/hero with heading, subheading, and CTA.', {
    heading: opt('string', 'Main heading'),
    subheading: opt('string', 'Subheading text'),
    ctaText: opt('string', 'CTA button text'),
    width: opt('number', 'Width', 1440),
    brandColor: opt('string', 'Accent color'),
    parentId: opt('string', 'Parent node'),
  }, 'create'),
}

// ═══ MODIFY & STYLE (25) ═══
const MODIFY = {
  modify_node: tool('modify_node', 'Modify properties of any existing node.', {
    nodeId: req('string', 'Target node ID'),
    x: opt('number','X'), y: opt('number','Y'), width: opt('number','Width'), height: opt('number','Height'),
    name: opt('string','Name'), visible: opt('boolean','Visibility'), locked: opt('boolean','Lock'),
    opacity: opt('number','Opacity 0-1'), rotation: opt('number','Rotation degrees'),
    cornerRadius: opt('number','Corner radius'), fill: opt('string','Fill color'),
  }, 'modify'),

  set_fill: tool('set_fill', 'Set fill on a node. Supports solid, linear gradient, radial gradient, and multiple fills.', {
    nodeId: req('string', 'Target node ID'),
    type: enm(['SOLID','LINEAR','RADIAL','ANGULAR','DIAMOND'], 'Fill type', 'SOLID'),
    color: opt('string', 'Solid fill hex color'),
    gradient: opt('object', '{ angle, stops: [{ position: 0-1, color: "#hex" }] }'),
    opacity: opt('number', 'Fill opacity 0-1'),
    fills: opt('array', 'Array of fill objects for multiple fills'),
  }, 'modify'),

  set_stroke: tool('set_stroke', 'Add border/stroke to a node.', {
    nodeId: req('string', 'Target node ID'),
    color: opt('string', 'Stroke color hex'), weight: opt('number', 'Stroke weight', 1),
    align: enm(['INSIDE','OUTSIDE','CENTER'], 'Stroke alignment', 'INSIDE'),
    dashPattern: opt('array', 'Dash pattern array, e.g. [4, 4]'),
    opacity: opt('number', 'Stroke opacity'),
  }, 'modify'),

  set_effects: tool('set_effects', 'Add shadows, blur, or background blur effects.', {
    nodeId: req('string', 'Target node ID'),
    shadow: opt('object', '{ color, offsetX, offsetY, blur, spread }'),
    innerShadow: opt('object', '{ color, offsetX, offsetY, blur, spread }'),
    blur: opt('number', 'Layer blur amount'),
    backgroundBlur: opt('number', 'Background blur (glassmorphism)'),
    preset: enm(['sm','md','lg','xl'], 'Use preset shadow size'),
  }, 'modify'),

  set_image_fill: tool('set_image_fill', 'Set an image fill on a node from URL.', {
    nodeId: req('string', 'Target node ID'),
    url: req('string', 'Image URL'),
    scaleMode: enm(['FILL','FIT','CROP','TILE'], 'Scale mode', 'FILL'),
  }, 'modify'),

  style_text_range: tool('style_text_range', 'Apply mixed styling within a text node. Style specific character ranges differently.', {
    nodeId: req('string', 'Text node ID'),
    ranges: { type:'array', items:{type:'object'}, description:'Array of { start, end, fontSize, fontWeight, color, textDecoration }', _required:true },
  }, 'modify'),

  set_constraints: tool('set_constraints', 'Set responsive constraints on a node.', {
    nodeId: req('string', 'Target node ID'),
    horizontal: enm(['MIN','CENTER','MAX','STRETCH','SCALE'], 'Horizontal constraint'),
    vertical: enm(['MIN','CENTER','MAX','STRETCH','SCALE'], 'Vertical constraint'),
  }, 'modify'),

  delete_node: tool('delete_node', 'Remove a node from the canvas.', {
    nodeId: req('string', 'Node ID to delete'),
  }, 'modify'),

  move_to_parent: tool('move_to_parent', 'Move a node into a different parent frame.', {
    nodeId: req('string', 'Node to move'),
    parentId: req('string', 'New parent ID'),
    index: opt('number', 'Position index within parent'),
  }, 'modify'),

  duplicate_node: tool('duplicate_node', 'Duplicate a node.', {
    nodeId: req('string', 'Node to duplicate'),
    count: opt('number', 'Number of duplicates', 1),
    offsetX: opt('number', 'X offset per copy'), offsetY: opt('number', 'Y offset per copy'),
  }, 'modify'),

  group_nodes: tool('group_nodes', 'Group multiple nodes together.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Node IDs to group', _required:true },
    name: opt('string', 'Group name'),
  }, 'modify'),

  ungroup_nodes: tool('ungroup_nodes', 'Ungroup a group node.', {
    nodeId: req('string', 'Group node to ungroup'),
  }, 'modify'),

  resize_node: tool('resize_node', 'Resize a node with optional constraint preservation.', {
    nodeId: req('string', 'Node to resize'),
    width: opt('number', 'New width'), height: opt('number', 'New height'),
    preserveAspect: opt('boolean', 'Maintain aspect ratio'),
  }, 'modify'),

  align_nodes: tool('align_nodes', 'Align multiple nodes relative to each other.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Nodes to align', _required:true },
    alignment: enm(['LEFT','CENTER','RIGHT','TOP','MIDDLE','BOTTOM','DISTRIBUTE_H','DISTRIBUTE_V'], 'Alignment type'),
  }, 'modify'),

  set_corner_radius: tool('set_corner_radius', 'Set corner radius with per-corner control.', {
    nodeId: req('string', 'Target node'),
    radius: opt('number', 'Uniform radius'),
    topLeft: opt('number',''), topRight: opt('number',''), bottomRight: opt('number',''), bottomLeft: opt('number',''),
  }, 'modify'),

  set_opacity: tool('set_opacity', 'Set node opacity.', {
    nodeId: req('string', 'Target node'), opacity: req('number', 'Opacity 0-1'),
  }, 'modify'),

  set_blend_mode: tool('set_blend_mode', 'Set blend mode.', {
    nodeId: req('string', 'Target node'),
    blendMode: enm(['NORMAL','MULTIPLY','SCREEN','OVERLAY','DARKEN','LIGHTEN','COLOR_DODGE','COLOR_BURN','HARD_LIGHT','SOFT_LIGHT','DIFFERENCE','EXCLUSION','HUE','SATURATION','COLOR','LUMINOSITY'], 'Blend mode'),
  }, 'modify'),

  set_clip_content: tool('set_clip_content', 'Toggle clip content on a frame.', {
    nodeId: req('string', 'Frame node'), clip: req('boolean', 'Clip content'),
  }, 'modify'),

  rename_node: tool('rename_node', 'Rename a node.', {
    nodeId: req('string', 'Target node'), name: req('string', 'New name'),
  }, 'modify'),

  lock_node: tool('lock_node', 'Lock/unlock a node.', {
    nodeId: req('string', 'Target node'), locked: req('boolean', 'Lock state'),
  }, 'modify'),

  set_visibility: tool('set_visibility', 'Show/hide a node.', {
    nodeId: req('string', 'Target node'), visible: req('boolean', 'Visibility'),
  }, 'modify'),

  reorder_node: tool('reorder_node', 'Change z-order of a node.', {
    nodeId: req('string', 'Target node'),
    direction: enm(['FRONT','BACK','FORWARD','BACKWARD'], 'Reorder direction'),
  }, 'modify'),

  set_layout_sizing: tool('set_layout_sizing', 'Set how a child behaves in auto-layout.', {
    nodeId: req('string', 'Child node'),
    horizontal: enm(['FIXED','HUG','FILL'], 'Horizontal sizing'),
    vertical: enm(['FIXED','HUG','FILL'], 'Vertical sizing'),
  }, 'modify'),

  flatten_node: tool('flatten_node', 'Flatten a node into a single vector.', {
    nodeId: req('string', 'Node to flatten'),
  }, 'modify'),

  set_rotation: tool('set_rotation', 'Rotate a node.', {
    nodeId: req('string', 'Target node'), angle: req('number', 'Rotation in degrees'),
  }, 'modify'),
}

// ═══ VECTOR & BOOLEAN (8) ═══
const VECTOR = {
  create_vector: tool('create_vector', 'Draw custom vector paths using SVG-like path data.', {
    name: opt('string', 'Vector name'),
    pathData: req('string', 'SVG path data (M, L, C, Q, Z commands)'),
    fill: opt('string', 'Fill color'), stroke: opt('string', 'Stroke color'),
    strokeWeight: opt('number', 'Stroke weight'),
    parentId: opt('string', 'Parent node ID'),
  }, 'vector'),

  boolean_operation: tool('boolean_operation', 'Perform boolean operations on shapes.', {
    operation: enm(['UNION','SUBTRACT','INTERSECT','EXCLUDE'], 'Boolean operation type'),
    nodeIds: { type:'array', items:{type:'string'}, description:'Node IDs (first is base shape)', _required:true },
  }, 'vector'),

  create_polygon: tool('create_polygon', 'Create a regular polygon.', {
    sides: req('number', 'Number of sides (3=triangle, 5=pentagon, 6=hexagon, etc.)'),
    size: req('number', 'Diameter'),
    fill: opt('string', 'Fill color'), name: opt('string', 'Name'),
    parentId: opt('string', 'Parent node ID'),
  }, 'vector'),

  create_star: tool('create_star', 'Create a star shape.', {
    points: opt('number', 'Number of points', 5),
    outerRadius: req('number', 'Outer radius'),
    innerRadius: opt('number', 'Inner radius (ratio to outer)'),
    fill: opt('string', 'Fill color'), name: opt('string', 'Name'),
    parentId: opt('string', 'Parent node ID'),
  }, 'vector'),

  offset_path: tool('offset_path', 'Offset/expand a vector path.', {
    nodeId: req('string', 'Vector node'), offset: req('number', 'Offset amount'),
  }, 'vector'),

  create_arrow: tool('create_arrow', 'Create an arrow shape.', {
    length: req('number', 'Arrow length'), direction: enm(['RIGHT','LEFT','UP','DOWN'], 'Direction', 'RIGHT'),
    strokeWeight: opt('number', 'Weight', 2), color: opt('string', 'Color'),
    parentId: opt('string', 'Parent node ID'),
  }, 'vector'),

  create_icon: tool('create_icon', 'Create a common UI icon from built-in set.', {
    icon: req('string', 'Icon name: arrow-right, arrow-left, arrow-up, arrow-down, check, x, plus, minus, search, menu, settings, user, heart, star, home, mail, phone, calendar, clock, bell, lock, unlock, eye, eye-off, edit, trash, download, upload, link, external-link, copy, share, filter, sort, grid, list, chevron-right, chevron-left, chevron-down, chevron-up'),
    size: opt('number', 'Icon size', 24), color: opt('string', 'Color'),
    parentId: opt('string', 'Parent node ID'),
  }, 'vector'),

  create_divider: tool('create_divider', 'Create a horizontal or vertical divider line.', {
    direction: enm(['HORIZONTAL','VERTICAL'], 'Direction', 'HORIZONTAL'),
    length: opt('number', 'Length (auto-fills parent if omitted)'),
    color: opt('string', 'Color'), thickness: opt('number', 'Thickness', 1),
    parentId: opt('string', 'Parent node ID'),
  }, 'vector'),
}

// ═══ READ & INSPECT (18) ═══
const READ = {
  get_selection: tool('get_selection', 'Get the currently selected nodes with full properties.', {}, 'read'),

  get_page_structure: tool('get_page_structure', 'Get the full page layer tree with types, names, and hierarchy.', {
    depth: opt('number', 'Max depth to traverse', 3),
    pageId: opt('string', 'Page ID (uses current page if omitted)'),
  }, 'read'),

  get_node_info: tool('get_node_info', 'Get detailed properties of a specific node including fills, effects, auto-layout, and text styles.', {
    nodeId: req('string', 'Node ID to inspect'),
  }, 'read'),

  get_nodes_info: tool('get_nodes_info', 'Get detailed properties of multiple nodes.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Array of node IDs', _required:true },
  }, 'read'),

  find_nodes: tool('find_nodes', 'Search for nodes by name, type, or properties.', {
    query: opt('string', 'Search by name (partial match)'),
    type: enm(['FRAME','TEXT','RECTANGLE','ELLIPSE','LINE','COMPONENT','INSTANCE','GROUP','VECTOR','BOOLEAN_OPERATION','SECTION'], 'Filter by type'),
    withinId: opt('string', 'Search within this node'),
  }, 'read'),

  get_local_styles: tool('get_local_styles', 'Get all local paint, text, and effect styles in the file.', {}, 'read'),

  get_local_variables: tool('get_local_variables', 'Get all local variable collections and variables.', {}, 'read'),

  list_components: tool('list_components', 'List all components in the file.', {
    pageId: opt('string', 'Filter to specific page'),
  }, 'read'),

  list_pages: tool('list_pages', 'List all pages in the document.', {}, 'read'),

  get_document_info: tool('get_document_info', 'Get document name, pages, and metadata.', {}, 'read'),

  set_selection: tool('set_selection', 'Select nodes and optionally scroll viewport to them.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Node IDs to select', _required:true },
    zoomToFit: opt('boolean', 'Scroll and zoom to show selection', true),
  }, 'read'),

  set_focus: tool('set_focus', 'Focus viewport on a specific node.', {
    nodeId: req('string', 'Node to focus on'),
    zoom: opt('number', 'Zoom level 0.1-10'),
  }, 'read'),

  get_annotations: tool('get_annotations', 'Get all annotations/comments on the document or a specific node.', {
    nodeId: opt('string', 'Node to get annotations for'),
  }, 'read'),

  set_annotation: tool('set_annotation', 'Create or update an annotation with markdown support.', {
    nodeId: req('string', 'Node to annotate'),
    text: req('string', 'Annotation text (markdown supported)'),
  }, 'read'),

  list_available_fonts: tool('list_available_fonts', 'Get all fonts available in the Figma file.', {}, 'read'),

  read_node_css: tool('read_node_css', 'Get CSS representation of a node (for developer handoff).', {
    nodeId: req('string', 'Node to get CSS for'),
    format: enm(['css','tailwind','react-inline'], 'Output format', 'css'),
  }, 'read'),

  get_selection_colors: tool('get_selection_colors', 'Extract all colors used in the current selection.', {}, 'read'),

  measure_distance: tool('measure_distance', 'Measure distance between two nodes.', {
    nodeId1: req('string', 'First node'), nodeId2: req('string', 'Second node'),
  }, 'read'),
}

// ═══ VARIABLES & TOKENS (10) ═══
const VARIABLES = {
  create_variable_collection: tool('create_variable_collection', 'Create a design token collection with modes (e.g. Light/Dark).', {
    name: req('string', 'Collection name (e.g. "Colors", "Spacing")'),
    modes: opt('array', 'Mode names, e.g. ["Light", "Dark"]'),
  }, 'variables'),

  create_variable: tool('create_variable', 'Create a design variable/token.', {
    name: req('string', 'Variable name (e.g. "primary-500", "spacing-md")'),
    collectionId: req('string', 'Collection ID'),
    type: enm(['COLOR','FLOAT','STRING','BOOLEAN'], 'Variable type'),
    value: req('string', 'Value (hex for COLOR, number for FLOAT, etc.)'),
    modeValues: opt('object', 'Values per mode: { "Light": "#000", "Dark": "#fff" }'),
  }, 'variables'),

  bind_variable: tool('bind_variable', 'Bind a variable to a node property.', {
    nodeId: req('string', 'Target node'),
    property: req('string', 'Property to bind: fills, strokes, cornerRadius, paddingTop, etc.'),
    variableId: req('string', 'Variable ID to bind'),
  }, 'variables'),

  get_variables: tool('get_variables', 'List all variable collections and their variables.', {}, 'variables'),

  update_variable: tool('update_variable', 'Update a variable value.', {
    variableId: req('string', 'Variable ID'),
    value: req('string', 'New value'),
    mode: opt('string', 'Mode to update (updates default if omitted)'),
  }, 'variables'),

  delete_variable: tool('delete_variable', 'Delete a variable.', {
    variableId: req('string', 'Variable to delete'),
  }, 'variables'),

  create_design_tokens: tool('create_design_tokens', 'Generate a complete design token system from a brand color. Creates color, spacing, radius, and typography collections.', {
    brandColor: req('string', 'Primary brand color hex'),
    name: opt('string', 'Token set name', 'Design System'),
    withModes: opt('boolean', 'Create Light + Dark modes', true),
  }, 'variables'),

  import_tokens: tool('import_tokens', 'Import design tokens from JSON (W3C Design Token format).', {
    json: req('string', 'JSON string of design tokens'),
    collectionName: opt('string', 'Collection name'),
  }, 'variables'),

  export_tokens: tool('export_tokens', 'Export all design tokens as JSON, CSS custom properties, SCSS, or Tailwind config.', {
    format: enm(['json','css','scss','tailwind'], 'Export format', 'json'),
  }, 'variables'),

  swap_mode: tool('swap_mode', 'Switch the active mode on a variable collection.', {
    collectionId: req('string', 'Collection ID'),
    mode: req('string', 'Mode name to activate'),
  }, 'variables'),
}

// ═══ EXPORT & CODE (10) ═══
const EXPORT = {
  export_as_svg: tool('export_as_svg', 'Export a node as SVG markup.', {
    nodeId: req('string', 'Node to export'),
  }, 'export'),

  export_as_png: tool('export_as_png', 'Export a node as PNG.', {
    nodeId: req('string', 'Node to export'),
    scale: opt('number', 'Scale factor', 2),
  }, 'export'),

  export_to_react: tool('export_to_react', 'Generate React + Tailwind code from a Figma node tree.', {
    nodeId: req('string', 'Root node to convert'),
    framework: enm(['react-tailwind','react-css','html-css','vue','svelte'], 'Output framework', 'react-tailwind'),
    componentName: opt('string', 'Root component name'),
  }, 'export'),

  export_design_specs: tool('export_design_specs', 'Generate design specifications document for developer handoff.', {
    nodeId: req('string', 'Node to document'),
    format: enm(['markdown','json','html'], 'Spec format', 'markdown'),
  }, 'export'),

  export_assets: tool('export_assets', 'Batch export all exportable assets (icons, images) from a node tree.', {
    nodeId: req('string', 'Root node'),
    format: enm(['svg','png','pdf'], 'Export format', 'svg'),
    scale: opt('number', 'Scale factor', 1),
  }, 'export'),

  screenshot: tool('screenshot', 'Take a screenshot of the current canvas view or a specific node.', {
    nodeId: opt('string', 'Node to screenshot (uses viewport if omitted)'),
    scale: opt('number', 'Scale factor', 2),
  }, 'export'),

  copy_css: tool('copy_css', 'Copy CSS properties of a node to clipboard.', {
    nodeId: req('string', 'Node to get CSS for'),
  }, 'export'),

  generate_stylesheet: tool('generate_stylesheet', 'Generate a complete stylesheet from a design file.', {
    pageId: opt('string', 'Page ID'),
    format: enm(['css','scss','tailwind'], 'Output format', 'css'),
  }, 'export'),

  export_color_palette: tool('export_color_palette', 'Export all colors used as a palette.', {
    format: enm(['json','css','scss','tailwind','figma-tokens'], 'Format', 'json'),
  }, 'export'),

  export_typography: tool('export_typography', 'Export all text styles as a typography system.', {
    format: enm(['json','css','scss','tailwind'], 'Format', 'json'),
  }, 'export'),

  export_component_inventory: tool('export_component_inventory', 'Export a complete inventory of all components with usage counts.', {
    format: enm(['json','markdown','csv'], 'Format', 'json'),
  }, 'export'),

  export_spacing_tokens: tool('export_spacing_tokens', 'Export all spacing values used as a spacing token system.', {
    format: enm(['json','css','scss','tailwind'], 'Format', 'json'),
  }, 'export'),
}

// ═══ ACCESSIBILITY & LINT (12) ═══
const ACCESSIBILITY = {
  audit_accessibility: tool('audit_accessibility', 'Run a full accessibility audit on a node tree. Checks contrast, touch targets, font sizes, focus indicators.', {
    nodeId: req('string', 'Root node to audit'),
  }, 'accessibility'),

  check_contrast: tool('check_contrast', 'Check color contrast ratio between two colors.', {
    foreground: req('string', 'Foreground color hex'),
    background: req('string', 'Background color hex'),
  }, 'accessibility'),

  fix_touch_targets: tool('fix_touch_targets', 'Auto-fix all touch targets below 44px in a node tree.', {
    nodeId: req('string', 'Root node to fix'),
  }, 'accessibility'),

  lint_design: tool('lint_design', 'Run design lint rules: spacing consistency, naming conventions, color usage, font sizes, alignment.', {
    nodeId: req('string', 'Root node to lint'),
    rules: opt('array', 'Specific rules to check. Omit for all.'),
  }, 'accessibility'),

  fix_spacing: tool('fix_spacing', 'Auto-fix all spacing values to nearest 8px grid value.', {
    nodeId: req('string', 'Root node to fix'),
    grid: opt('number', 'Grid size', 8),
  }, 'accessibility'),

  check_naming: tool('check_naming', 'Check layer naming conventions. Flags generic names like "Frame 123", "Group 5".', {
    nodeId: req('string', 'Root node to check'),
  }, 'accessibility'),

  suggest_improvements: tool('suggest_improvements', 'AI-powered design improvement suggestions based on the design intelligence engine.', {
    nodeId: req('string', 'Node to analyze'),
  }, 'accessibility'),

  validate_component: tool('validate_component', 'Validate a component follows design system rules.', {
    nodeId: req('string', 'Component to validate'),
  }, 'accessibility'),

  check_consistency: tool('check_consistency', 'Check for inconsistent colors, fonts, spacing, and radii across a design.', {
    nodeId: req('string', 'Root node to check'),
  }, 'accessibility'),

  generate_a11y_report: tool('generate_a11y_report', 'Generate a detailed accessibility compliance report.', {
    nodeId: req('string', 'Root node'),
    standard: enm(['WCAG-AA','WCAG-AAA'], 'Compliance standard', 'WCAG-AA'),
    format: enm(['markdown','json','html'], 'Report format', 'markdown'),
  }, 'accessibility'),

  color_blindness_check: tool('color_blindness_check', 'Simulate color blindness on a design to check for issues.', {
    nodeId: req('string', 'Node to check'),
    type: enm(['protanopia','deuteranopia','tritanopia','achromatopsia'], 'Color blindness type'),
  }, 'accessibility'),

  responsive_check: tool('responsive_check', 'Check if a design handles different viewport widths correctly.', {
    nodeId: req('string', 'Root frame to check'),
    breakpoints: opt('array', 'Widths to check, e.g. [375, 768, 1024, 1440]'),
  }, 'accessibility'),
}

// ═══ BATCH OPERATIONS (12) ═══
const BATCH = {
  batch_rename: tool('batch_rename', 'Rename multiple nodes using a pattern.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Nodes to rename', _required:true },
    pattern: req('string', 'Name pattern. Use {n} for number, {name} for current name. E.g. "Card {n}"'),
    startNumber: opt('number', 'Starting number', 1),
  }, 'batch'),

  batch_style: tool('batch_style', 'Apply style changes to multiple nodes at once.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Target nodes', _required:true },
    changes: req('object', 'Style changes: { fill, opacity, cornerRadius, fontSize, fontWeight, ... }'),
  }, 'batch'),

  batch_replace_text: tool('batch_replace_text', 'Find and replace text across multiple text nodes.', {
    find: req('string', 'Text to find'),
    replace: req('string', 'Replacement text'),
    nodeId: opt('string', 'Scope to search within (uses whole page if omitted)'),
    matchCase: opt('boolean', 'Case sensitive', false),
  }, 'batch'),

  batch_replace_color: tool('batch_replace_color', 'Replace a color across all nodes.', {
    find: req('string', 'Color to find (hex)'),
    replace: req('string', 'Replacement color (hex)'),
    nodeId: opt('string', 'Scope node'),
  }, 'batch'),

  batch_resize: tool('batch_resize', 'Resize multiple nodes.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Target nodes', _required:true },
    width: opt('number','New width'), height: opt('number','New height'),
    scale: opt('number', 'Scale factor'),
  }, 'batch'),

  batch_align: tool('batch_align', 'Align multiple nodes.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Nodes to align', _required:true },
    horizontal: enm(['LEFT','CENTER','RIGHT','DISTRIBUTE'], 'H alignment'),
    vertical: enm(['TOP','MIDDLE','BOTTOM','DISTRIBUTE'], 'V alignment'),
  }, 'batch'),

  batch_delete: tool('batch_delete', 'Delete multiple nodes.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Nodes to delete', _required:true },
  }, 'batch'),

  batch_duplicate: tool('batch_duplicate', 'Duplicate multiple nodes.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Nodes to duplicate', _required:true },
    offsetX: opt('number', 'X offset per copy'), offsetY: opt('number', 'Y offset per copy'),
  }, 'batch'),

  batch_set_visibility: tool('batch_set_visibility', 'Show/hide multiple nodes.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Target nodes', _required:true },
    visible: req('boolean', 'Visibility state'),
  }, 'batch'),

  batch_lock: tool('batch_lock', 'Lock/unlock multiple nodes.', {
    nodeIds: { type:'array', items:{type:'string'}, description:'Target nodes', _required:true },
    locked: req('boolean', 'Lock state'),
  }, 'batch'),

  select_all_by_type: tool('select_all_by_type', 'Select all nodes of a specific type.', {
    type: enm(['FRAME','TEXT','RECTANGLE','ELLIPSE','COMPONENT','INSTANCE','GROUP'], 'Node type'),
    withinId: opt('string', 'Scope node'),
  }, 'batch'),

  clean_hidden_layers: tool('clean_hidden_layers', 'Remove all hidden layers from a node tree.', {
    nodeId: req('string', 'Root node to clean'),
    dryRun: opt('boolean', 'Preview changes without deleting', false),
  }, 'batch'),

  batch_set_font: tool('batch_set_font', 'Change font family on all text nodes in a scope.', {
    fontFamily: req('string', 'New font family'),
    nodeId: opt('string', 'Scope'),
  }, 'batch'),

  batch_round_values: tool('batch_round_values', 'Round all dimensions, positions, and spacing to whole pixels.', {
    nodeId: req('string', 'Root node'),
  }, 'batch'),

  batch_remove_strokes: tool('batch_remove_strokes', 'Remove all strokes from nodes in a scope.', {
    nodeId: req('string', 'Root node'),
  }, 'batch'),

  batch_remove_effects: tool('batch_remove_effects', 'Remove all effects from nodes in a scope.', {
    nodeId: req('string', 'Root node'),
  }, 'batch'),

  batch_set_corner_radius: tool('batch_set_corner_radius', 'Set corner radius on all frames/rectangles in scope.', {
    nodeId: req('string', 'Root node'),
    radius: req('number', 'Corner radius'),
  }, 'batch'),
}

// ═══ DESIGN SYSTEM (10) ═══
const DESIGN_SYSTEM = {
  scan_design_system: tool('scan_design_system', 'Scan a file and extract the implied design system: colors, fonts, spacing, components.', {
    pageId: opt('string', 'Page to scan'),
  }, 'design-system'),

  create_style_guide: tool('create_style_guide', 'Generate a visual style guide page from the current design system.', {
    brandColor: opt('string', 'Brand color to use'),
    mode: enm(['dark','light'], 'Mode', 'dark'),
  }, 'design-system'),

  detect_inconsistencies: tool('detect_inconsistencies', 'Find design inconsistencies: off-grid spacing, non-standard colors, mismatched fonts.', {
    nodeId: opt('string', 'Scope node'),
  }, 'design-system'),

  normalize_design: tool('normalize_design', 'Auto-fix a design to match the implied design system. Snaps spacing, normalizes colors, fixes font weights.', {
    nodeId: req('string', 'Root node to normalize'),
    dryRun: opt('boolean', 'Preview changes', false),
  }, 'design-system'),

  extract_components: tool('extract_components', 'Find repeated patterns and suggest component extraction.', {
    nodeId: req('string', 'Root node to analyze'),
  }, 'design-system'),

  get_design_craft_guide: tool('get_design_craft_guide', 'Get the professional design rules: typography, color, spacing, anti-AI-slop patterns. Use this before creating any design.', {}, 'design-system'),

  suggest_color_palette: tool('suggest_color_palette', 'Generate a color palette from a single brand color.', {
    brandColor: req('string', 'Brand color hex'),
    mode: enm(['dark','light','both'], 'Mode', 'both'),
  }, 'design-system'),

  suggest_type_scale: tool('suggest_type_scale', 'Generate a typography scale.', {
    baseSize: opt('number', 'Base font size', 16),
    ratio: enm(['minor2','major2','minor3','major3','perfect4','aug4','perfect5','golden'], 'Scale ratio', 'major2'),
  }, 'design-system'),

  import_design_system: tool('import_design_system', 'Import a design system from JSON config and create all tokens, styles, and components.', {
    config: req('string', 'JSON config string with colors, fonts, spacing, components'),
  }, 'design-system'),

  compare_to_system: tool('compare_to_system', 'Compare a design to the established design system and flag deviations.', {
    nodeId: req('string', 'Node to compare'),
  }, 'design-system'),
}

// ═══ RESPONSIVE (5) ═══
const RESPONSIVE = {
  create_responsive_variant: tool('create_responsive_variant', 'Create mobile/tablet/desktop variants of a frame.', {
    nodeId: req('string', 'Source frame'),
    breakpoints: opt('array', 'Target widths', [375, 768, 1440]),
  }, 'responsive'),

  set_breakpoint: tool('set_breakpoint', 'Resize a frame to a standard breakpoint.', {
    nodeId: req('string', 'Frame to resize'),
    breakpoint: enm(['mobile','tablet','desktop','wide'], 'Breakpoint'),
  }, 'responsive'),

  convert_to_responsive: tool('convert_to_responsive', 'Convert fixed-width designs to responsive auto-layout.', {
    nodeId: req('string', 'Root frame to convert'),
  }, 'responsive'),

  generate_mobile: tool('generate_mobile', 'Generate a mobile-optimized version of a desktop design.', {
    nodeId: req('string', 'Desktop frame'),
    width: opt('number', 'Mobile width', 375),
  }, 'responsive'),

  stack_for_mobile: tool('stack_for_mobile', 'Convert horizontal layouts to vertical stacking for mobile.', {
    nodeId: req('string', 'Frame with horizontal layout'),
  }, 'responsive'),
}

// ═══ TYPOGRAPHY (10) ═══
const TYPOGRAPHY = {
  type_scale_apply: tool('type_scale_apply', 'Apply a type scale to all text in a frame. Maps headings, body, and caption sizes to the scale.', {
    nodeId: req('string', 'Root frame'),
    ratio: enm(['minor2','major2','minor3','major3','perfect4','aug4','perfect5','golden'], 'Scale ratio', 'major2'),
    baseSize: opt('number', 'Base font size', 16),
  }, 'typography'),

  type_audit: tool('type_audit', 'Find every unique text style in a page. Flag off-scale sizes, inconsistent weights, and orphaned styles.', {
    nodeId: opt('string', 'Scope node (page if omitted)'),
  }, 'typography'),

  type_set_hierarchy: tool('type_set_hierarchy', 'Set heading levels with proper size, weight, and line-height ratios.', {
    nodeId: req('string', 'Root frame'),
    levels: opt('number', 'Number of heading levels', 6),
  }, 'typography'),

  type_check_measure: tool('type_check_measure', 'Check line length (45-75 chars optimal), line-height, and letter-spacing for readability.', {
    nodeId: req('string', 'Text node or frame to check'),
  }, 'typography'),

  type_normalize: tool('type_normalize', 'Normalize all text to the nearest type scale value. Fix off-scale sizes.', {
    nodeId: req('string', 'Root frame'),
    ratio: enm(['minor2','major2','minor3','major3','perfect4'], 'Scale ratio', 'major2'),
  }, 'typography'),

  type_list_styles: tool('type_list_styles', 'List all text styles with usage count.', {
    nodeId: opt('string', 'Scope'),
  }, 'typography'),

  type_pair_suggest: tool('type_pair_suggest', 'Suggest font pairings based on currently loaded fonts.', {
    primaryFont: opt('string', 'Primary font family'),
  }, 'typography'),

  type_replace_font: tool('type_replace_font', 'Replace one font family with another across all text nodes.', {
    find: req('string', 'Font to replace'),
    replace: req('string', 'Replacement font'),
    nodeId: opt('string', 'Scope'),
  }, 'typography'),

  set_text_content: tool('set_text_content', 'Update text content of a text node without changing styles.', {
    nodeId: req('string', 'Text node ID'),
    text: req('string', 'New text content'),
  }, 'typography'),

  type_create_style: tool('type_create_style', 'Create a local text style from a text node.', {
    nodeId: req('string', 'Text node to create style from'),
    name: req('string', 'Style name'),
  }, 'typography'),
}

// ═══ COLOR (10) ═══
const COLOR = {
  color_palette_generate: tool('color_palette_generate', 'Generate a full color palette (50-950 shades) from a base color.', {
    baseColor: req('string', 'Base color hex'),
    steps: opt('number', 'Number of shade steps', 10),
  }, 'color'),

  color_extract: tool('color_extract', 'Extract all unique colors from a frame and organize by usage frequency.', {
    nodeId: req('string', 'Root node'),
  }, 'color'),

  color_harmonize: tool('color_harmonize', 'Generate harmonious colors: complementary, triadic, analogous, split-complementary.', {
    baseColor: req('string', 'Base color hex'),
    scheme: enm(['complementary','triadic','analogous','split-complementary','tetradic','monochromatic'], 'Color scheme'),
  }, 'color'),

  color_darkmode: tool('color_darkmode', 'Generate a dark mode variant of a frame, mapping all colors intelligently.', {
    nodeId: req('string', 'Frame to convert'),
    brandColor: opt('string', 'Brand color to preserve'),
  }, 'color'),

  color_lightmode: tool('color_lightmode', 'Generate a light mode variant of a dark frame.', {
    nodeId: req('string', 'Frame to convert'),
    brandColor: opt('string', 'Brand color to preserve'),
  }, 'color'),

  color_check_all: tool('color_check_all', 'Check WCAG contrast for every text/background pair in a frame.', {
    nodeId: req('string', 'Root frame'),
    standard: enm(['AA','AAA'], 'WCAG standard', 'AA'),
  }, 'color'),

  color_create_style: tool('color_create_style', 'Create a local color style.', {
    name: req('string', 'Style name (e.g. "Primary/500")'),
    color: req('string', 'Color hex'),
  }, 'color'),

  color_apply_style: tool('color_apply_style', 'Apply a color style to a node.', {
    nodeId: req('string', 'Target node'),
    styleName: req('string', 'Style name to apply'),
    property: enm(['fill','stroke'], 'Property to apply to', 'fill'),
  }, 'color'),

  color_replace_global: tool('color_replace_global', 'Replace a color across the entire document (all pages).', {
    find: req('string', 'Color to find (hex)'),
    replace: req('string', 'Replacement color (hex)'),
  }, 'color'),

  color_generate_semantic: tool('color_generate_semantic', 'Generate a full semantic color system (bg, surface, border, text, brand, status) from one brand color.', {
    brandColor: req('string', 'Brand color hex'),
    mode: enm(['dark','light','both'], 'Color mode', 'both'),
  }, 'color'),
}

// ═══ PROTOTYPE & INTERACTION (10) ═══
const PROTOTYPE = {
  create_prototype_link: tool('create_prototype_link', 'Create a prototype navigation link between two frames.', {
    fromNodeId: req('string', 'Source node (trigger)'),
    toNodeId: req('string', 'Destination frame'),
    trigger: enm(['ON_CLICK','ON_HOVER','ON_PRESS','ON_DRAG','AFTER_TIMEOUT','MOUSE_ENTER','MOUSE_LEAVE','MOUSE_DOWN','MOUSE_UP'], 'Interaction trigger', 'ON_CLICK'),
    transition: enm(['INSTANT','DISSOLVE','SLIDE_IN','SLIDE_OUT','PUSH','MOVE_IN','MOVE_OUT','SMART_ANIMATE'], 'Transition type', 'DISSOLVE'),
    duration: opt('number', 'Transition duration ms', 300),
  }, 'prototype'),

  create_scroll_behavior: tool('create_scroll_behavior', 'Set scroll behavior on a frame.', {
    nodeId: req('string', 'Frame node'),
    direction: enm(['HORIZONTAL','VERTICAL','BOTH','NONE'], 'Scroll direction'),
    overflow: enm(['VISIBLE','HIDDEN','SCROLL'], 'Overflow behavior', 'SCROLL'),
  }, 'prototype'),

  set_overflow: tool('set_overflow', 'Set overflow clipping on a frame.', {
    nodeId: req('string', 'Frame node'),
    clip: req('boolean', 'Clip content'),
  }, 'prototype'),

  create_overlay: tool('create_overlay', 'Set up a frame as a modal/overlay in prototype mode.', {
    nodeId: req('string', 'Overlay frame'),
    position: enm(['CENTER','TOP_LEFT','TOP_CENTER','TOP_RIGHT','BOTTOM_LEFT','BOTTOM_CENTER','BOTTOM_RIGHT','MANUAL'], 'Overlay position', 'CENTER'),
    closeOnClickOutside: opt('boolean', 'Close when clicking outside', true),
    backgroundDim: opt('number', 'Background dim opacity 0-1', 0.5),
  }, 'prototype'),

  set_fixed_position: tool('set_fixed_position', 'Pin a layer so it stays fixed during scroll (sticky nav, floating button).', {
    nodeId: req('string', 'Node to pin'),
    position: enm(['TOP','BOTTOM','LEFT','RIGHT'], 'Fixed position'),
  }, 'prototype'),

  create_hover_state: tool('create_hover_state', 'Create a hover variant interaction on a component.', {
    nodeId: req('string', 'Component or instance'),
    hoverVariant: req('string', 'Variant name for hover state'),
  }, 'prototype'),

  create_flow: tool('create_flow', 'Create a prototype flow starting point.', {
    nodeId: req('string', 'Starting frame'),
    name: req('string', 'Flow name'),
  }, 'prototype'),

  list_flows: tool('list_flows', 'List all prototype flows in the file.', {}, 'prototype'),

  remove_prototype_link: tool('remove_prototype_link', 'Remove a prototype connection.', {
    nodeId: req('string', 'Node to remove connection from'),
  }, 'prototype'),

  set_transition: tool('set_transition', 'Set the default transition for all prototype links on a frame.', {
    nodeId: req('string', 'Frame node'),
    transition: enm(['INSTANT','DISSOLVE','SLIDE_IN','SMART_ANIMATE'], 'Transition'),
    duration: opt('number', 'Duration ms', 300),
    easing: enm(['LINEAR','EASE_IN','EASE_OUT','EASE_IN_OUT','EASE_IN_BACK','EASE_OUT_BACK','CUSTOM_SPRING'], 'Easing', 'EASE_OUT'),
  }, 'prototype'),
}

// ═══ PAGE MANAGEMENT (8) ═══
const PAGE = {
  create_new_page: tool('create_new_page', 'Create a new page in the document.', {
    name: req('string', 'Page name'),
  }, 'page'),

  switch_page: tool('switch_page', 'Switch to a different page.', {
    pageId: req('string', 'Page ID or name'),
  }, 'page'),

  duplicate_page: tool('duplicate_page', 'Duplicate an entire page.', {
    pageId: req('string', 'Page to duplicate'),
    name: opt('string', 'New page name'),
  }, 'page'),

  delete_page: tool('delete_page', 'Delete a page.', {
    pageId: req('string', 'Page to delete'),
  }, 'page'),

  rename_page: tool('rename_page', 'Rename a page.', {
    pageId: req('string', 'Page ID'),
    name: req('string', 'New name'),
  }, 'page'),

  sort_pages: tool('sort_pages', 'Sort pages alphabetically or by custom order.', {
    order: enm(['ALPHABETICAL','REVERSE','CUSTOM'], 'Sort order'),
    customOrder: opt('array', 'Array of page IDs in desired order'),
  }, 'page'),

  merge_pages: tool('merge_pages', 'Move all content from one page into another.', {
    sourcePageId: req('string', 'Page to merge from'),
    targetPageId: req('string', 'Page to merge into'),
  }, 'page'),

  page_overview: tool('page_overview', 'Get an overview of all pages: name, frame count, component count.', {}, 'page'),
}

// ═══ LIBRARY & COMPONENTS EXTENDED (8) ═══
const LIBRARY = {
  search_library: tool('search_library', 'Search for components across local file and team libraries.', {
    query: req('string', 'Search query'),
    scope: enm(['LOCAL','TEAM','ALL'], 'Search scope', 'ALL'),
  }, 'library'),

  list_team_libraries: tool('list_team_libraries', 'List all available team libraries.', {}, 'library'),

  swap_component: tool('swap_component', 'Swap one component instance for another.', {
    instanceId: req('string', 'Instance to swap'),
    newComponentId: req('string', 'New component ID'),
    preserveOverrides: opt('boolean', 'Keep existing overrides', true),
  }, 'library'),

  detach_instance: tool('detach_instance', 'Detach a component instance to a regular frame.', {
    nodeId: req('string', 'Instance to detach'),
  }, 'library'),

  reset_overrides: tool('reset_overrides', 'Reset all overrides on a component instance.', {
    nodeId: req('string', 'Instance node'),
  }, 'library'),

  component_audit: tool('component_audit', 'Audit components: find detached instances, missing components, unused variants.', {
    nodeId: opt('string', 'Scope'),
  }, 'library'),

  batch_swap_component: tool('batch_swap_component', 'Swap all instances of one component for another across the file.', {
    oldComponentId: req('string', 'Component to replace'),
    newComponentId: req('string', 'Replacement component'),
  }, 'library'),

  publish_components: tool('publish_components', 'Mark components as ready to publish to team library.', {
    componentIds: { type:'array', items:{type:'string'}, description:'Components to mark', _required:true },
  }, 'library'),
}

// ═══ ANNOTATION & HANDOFF (10) ═══
const ANNOTATION = {
  annotate_spacing: tool('annotate_spacing', 'Add visual spacing annotations (redlines) to a frame.', {
    nodeId: req('string', 'Frame to annotate'),
    showPadding: opt('boolean', 'Show padding values', true),
    showGap: opt('boolean', 'Show gap values', true),
    showMargin: opt('boolean', 'Show margin values', true),
  }, 'annotation'),

  annotate_colors: tool('annotate_colors', 'Add color swatch annotations to a frame.', {
    nodeId: req('string', 'Frame to annotate'),
  }, 'annotation'),

  annotate_typography: tool('annotate_typography', 'Add typography annotations (font, size, weight, line-height) to text nodes.', {
    nodeId: req('string', 'Frame to annotate'),
  }, 'annotation'),

  create_measurement: tool('create_measurement', 'Create a measurement line between two nodes showing distance.', {
    nodeId1: req('string', 'First node'),
    nodeId2: req('string', 'Second node'),
    direction: enm(['HORIZONTAL','VERTICAL','AUTO'], 'Measurement direction', 'AUTO'),
  }, 'annotation'),

  create_spec_sheet: tool('create_spec_sheet', 'Generate a design specification sheet next to a frame with all measurements, colors, and typography.', {
    nodeId: req('string', 'Frame to spec'),
    position: enm(['RIGHT','BELOW'], 'Where to place spec', 'RIGHT'),
  }, 'annotation'),

  annotate_grid: tool('annotate_grid', 'Visualize the underlying grid and spacing system of a frame.', {
    nodeId: req('string', 'Frame to annotate'),
    gridSize: opt('number', 'Grid size to overlay', 8),
  }, 'annotation'),

  annotate_hierarchy: tool('annotate_hierarchy', 'Annotate the visual hierarchy: heading levels, reading order, focal points.', {
    nodeId: req('string', 'Frame to annotate'),
  }, 'annotation'),

  create_component_docs: tool('create_component_docs', 'Generate documentation frames for a component showing all variants, props, and usage.', {
    componentId: req('string', 'Component to document'),
  }, 'annotation'),

  annotate_responsive: tool('annotate_responsive', 'Annotate breakpoint behavior and responsive rules on a frame.', {
    nodeId: req('string', 'Frame to annotate'),
    breakpoints: opt('array', 'Breakpoints to annotate'),
  }, 'annotation'),

  create_changelog: tool('create_changelog', 'Compare two frames and generate a visual changelog showing what changed.', {
    beforeNodeId: req('string', 'Before frame'),
    afterNodeId: req('string', 'After frame'),
  }, 'annotation'),
}

// ═══ EFFECTS & STYLES EXTENDED (8) ═══
const EFFECTS = {
  create_glassmorphism: tool('create_glassmorphism', 'Apply glassmorphism effect: background blur, semi-transparent fill, subtle border.', {
    nodeId: req('string', 'Target frame'),
    blur: opt('number', 'Blur amount', 16),
    opacity: opt('number', 'Background opacity', 0.1),
  }, 'effects'),

  create_neumorphism: tool('create_neumorphism', 'Apply neumorphism effect: dual shadows (light + dark) with matching background.', {
    nodeId: req('string', 'Target node'),
    intensity: opt('number', 'Effect intensity 0-1', 0.5),
  }, 'effects'),

  create_noise_texture: tool('create_noise_texture', 'Add a subtle noise/grain texture overlay to a frame.', {
    nodeId: req('string', 'Target frame'),
    opacity: opt('number', 'Noise opacity', 0.05),
    scale: opt('number', 'Noise scale', 1),
  }, 'effects'),

  set_gradient_fill: tool('set_gradient_fill', 'Set a gradient fill with a simple angle + 2 colors API.', {
    nodeId: req('string', 'Target node'),
    startColor: req('string', 'Start color hex'),
    endColor: req('string', 'End color hex'),
    angle: opt('number', 'Gradient angle in degrees', 180),
  }, 'effects'),

  create_shadow_system: tool('create_shadow_system', 'Generate a consistent shadow elevation system (sm, md, lg, xl) as effect styles.', {
    baseColor: opt('string', 'Shadow base color', '#000000'),
    scale: enm(['subtle','medium','dramatic'], 'Shadow intensity', 'medium'),
  }, 'effects'),

  apply_backdrop_blur: tool('apply_backdrop_blur', 'Apply background blur (frosted glass effect) to a frame.', {
    nodeId: req('string', 'Target frame'),
    amount: opt('number', 'Blur amount', 16),
  }, 'effects'),

  create_border_gradient: tool('create_border_gradient', 'Create a gradient border effect using a slightly larger frame behind.', {
    nodeId: req('string', 'Target node'),
    startColor: req('string', 'Start color hex'),
    endColor: req('string', 'End color hex'),
    width: opt('number', 'Border width', 1),
  }, 'effects'),

  remove_all_effects: tool('remove_all_effects', 'Remove all effects (shadows, blurs) from a node.', {
    nodeId: req('string', 'Target node'),
  }, 'effects'),
}

// ═══ ASSEMBLE ALL TOOLS ═══
export const ALL_TOOLS = {
  ...CREATE, ...MODIFY, ...VECTOR, ...READ,
  ...VARIABLES, ...EXPORT, ...ACCESSIBILITY,
  ...BATCH, ...DESIGN_SYSTEM, ...RESPONSIVE,
  ...TYPOGRAPHY, ...COLOR, ...PROTOTYPE,
  ...PAGE, ...LIBRARY, ...ANNOTATION, ...EFFECTS,
}

export const TOOL_LIST = Object.values(ALL_TOOLS)
export const TOOL_COUNT = Object.keys(ALL_TOOLS).length

export const CATEGORIES = {
  create: Object.keys(CREATE),
  modify: Object.keys(MODIFY),
  vector: Object.keys(VECTOR),
  read: Object.keys(READ),
  variables: Object.keys(VARIABLES),
  export: Object.keys(EXPORT),
  accessibility: Object.keys(ACCESSIBILITY),
  batch: Object.keys(BATCH),
  'design-system': Object.keys(DESIGN_SYSTEM),
  responsive: Object.keys(RESPONSIVE),
  typography: Object.keys(TYPOGRAPHY),
  color: Object.keys(COLOR),
  prototype: Object.keys(PROTOTYPE),
  page: Object.keys(PAGE),
  library: Object.keys(LIBRARY),
  annotation: Object.keys(ANNOTATION),
  effects: Object.keys(EFFECTS),
}

export function getTool(name) { return ALL_TOOLS[name] || null }
export function getToolsByCategory(cat) { return CATEGORIES[cat] || [] }
