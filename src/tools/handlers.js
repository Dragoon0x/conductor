// ═══════════════════════════════════════════
// CONDUCTOR — Tool Handlers
// ═══════════════════════════════════════════
// Executes tool calls using design intelligence.
// Each handler returns { content: [{ type: 'text', text: string }] }

import * as design from '../design/intelligence.js';
import * as exporter from '../design/exporter.js';

function text(str) {
  return { content: [{ type: 'text', text: str }] };
}

function json(obj) {
  return text(JSON.stringify(obj, null, 2));
}

// ─── Handler Map ───
// Returns a response for each tool. Tools that need Figma connection
// return instructions; tools that are pure design logic execute immediately.

export function handleTool(toolName, args, figmaState) {
  const handler = HANDLERS[toolName];
  if (!handler) return text(`Unknown tool: ${toolName}`);
  try {
    return handler(args, figmaState);
  } catch (err) {
    return text(`Error in ${toolName}: ${err.message}`);
  }
}

const HANDLERS = {
  // ═══ CREATE ═══
  create_frame(args) {
    const padding = design.snapToGrid(args.padding || 16);
    const gap = design.snapToGrid(args.gap || 8);
    return json({
      action: 'create_frame',
      name: args.name,
      layoutMode: (args.direction || 'vertical').toUpperCase(),
      primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'MIN',
      paddingLeft: padding, paddingRight: padding, paddingTop: padding, paddingBottom: padding,
      itemSpacing: gap,
      width: args.width || null,
      height: args.height || null,
      fills: args.fill ? [{ type: 'SOLID', color: hexToFigmaColor(args.fill) }] : [],
      designNotes: `Padding: ${padding}px (grid-aligned), Gap: ${gap}px`,
    });
  },

  create_page(args) {
    const sections = args.sections || getDefaultSections(args.pageType);
    const colors = args.brandColor ? design.generateSemanticColors(args.brandColor) : null;
    const typeScale = design.generateTypeScale(16, 'major-third');

    return json({
      action: 'create_page',
      pageType: args.pageType,
      title: args.title || `${args.pageType} page`,
      sections,
      typeScale: typeScale.sizes.map(s => ({ label: s.label, size: s.size })),
      spacingScale: design.generateSpacingScale(8, 8),
      colors,
      darkMode: args.darkMode ? design.generateDarkMode(colors || {}) : null,
      designNotes: `Type scale: ${typeScale.scale} (${typeScale.ratio}). Grid: 8px. Sections: ${sections.join(', ')}`,
    });
  },

  create_section(args) {
    const patterns = {
      hero: { columns: 1, minHeight: 480, padding: 64, elements: ['heading', 'subheading', 'cta-group'] },
      features: { columns: args.columns || 3, padding: 48, elements: ['section-heading', 'feature-cards'] },
      testimonials: { columns: args.columns || 2, padding: 48, elements: ['section-heading', 'testimonial-cards'] },
      faq: { columns: 1, padding: 48, elements: ['section-heading', 'accordion-items'] },
      cta: { columns: 1, padding: 64, elements: ['heading', 'subheading', 'cta-button'] },
      pricing: { columns: args.columns || 3, padding: 48, elements: ['section-heading', 'pricing-cards'] },
      stats: { columns: args.columns || 4, padding: 48, elements: ['stat-items'] },
      team: { columns: args.columns || 3, padding: 48, elements: ['section-heading', 'team-cards'] },
      footer: { columns: 4, padding: 48, elements: ['logo', 'nav-groups', 'legal'] },
      header: { columns: 1, padding: 16, elements: ['logo', 'nav-links', 'cta-button'] },
    };

    const pattern = patterns[args.sectionType] || patterns.hero;
    return json({
      action: 'create_section',
      sectionType: args.sectionType,
      ...pattern,
      heading: args.heading,
      designNotes: `Section pattern: ${args.sectionType}. ${pattern.columns} columns, ${pattern.padding}px padding, grid-aligned.`,
    });
  },

  create_card(args) {
    const variant = args.variant || 'elevated';
    const shadows = design.generateElevation();
    const shadow = variant === 'elevated' ? shadows.find(s => s.step === 'md') : null;
    const radii = design.generateRadiusScale();
    const radius = radii.find(r => r.name === 'lg');

    return json({
      action: 'create_card',
      variant,
      width: args.width || 320,
      padding: 24,
      gap: 12,
      cornerRadius: radius?.value || 12,
      shadow: shadow?.css || 'none',
      title: args.title,
      description: args.description,
      hasImage: args.hasImage || false,
      hasAction: args.hasAction || false,
      designNotes: `${variant} card. 24px padding (3×8), 12px gap, ${radius?.value}px radius.`,
    });
  },

  create_form(args) {
    const fields = args.fields.map(f => ({
      ...f,
      inputHeight: 40,
      padding: { x: 12, y: 10 },
      fontSize: 14,
      labelSize: 13,
      gap: 4,
    }));

    return json({
      action: 'create_form',
      layout: args.layout || 'vertical',
      fieldGap: 20,
      submitLabel: args.submitLabel || 'Submit',
      fields,
      designNotes: `Form: ${fields.length} fields, ${args.layout || 'vertical'} layout. 40px input height, 14px text. All spacing grid-aligned.`,
    });
  },

  create_table(args) {
    return json({
      action: 'create_table',
      columns: args.columns,
      rows: args.rows || 5,
      headerHeight: 40,
      rowHeight: 48,
      cellPadding: { x: 16, y: 12 },
      hasPagination: args.hasPagination || false,
      hasSorting: args.hasSorting || false,
      hasCheckbox: args.hasCheckbox || false,
      designNotes: `Table: ${args.columns.length} cols × ${args.rows || 5} rows. Header: 40px, Row: 48px. 16px cell padding.`,
    });
  },

  create_modal(args) {
    const sizes = { sm: 400, md: 560, lg: 720, xl: 900 };
    const width = sizes[args.size || 'md'] || 560;

    return json({
      action: 'create_modal',
      title: args.title,
      width,
      padding: 24,
      headerHeight: 56,
      cornerRadius: 16,
      hasCloseButton: args.hasCloseButton !== false,
      actions: args.actions || ['Cancel', 'Confirm'],
      overlay: { color: '#000000', opacity: 0.5 },
      designNotes: `Modal: ${args.size || 'md'} (${width}px). 24px padding, 16px radius.`,
    });
  },

  create_nav(args) {
    return json({
      action: 'create_nav',
      navType: args.navType,
      items: args.items,
      logoText: args.logoText,
      hasSearch: args.hasSearch || false,
      hasAvatar: args.hasAvatar || false,
      height: args.navType === 'topbar' ? 56 : undefined,
      width: args.navType === 'sidebar' ? 240 : undefined,
      padding: { x: 16, y: 12 },
      itemGap: args.navType === 'tabs' ? 0 : 8,
      designNotes: `Nav: ${args.navType} with ${args.items.length} items. All spacing grid-aligned.`,
    });
  },

  // ═══ LAYOUT ═══
  layout_auto(args) {
    return json({
      action: 'set_auto_layout',
      nodeId: args.nodeId,
      direction: args.direction || 'auto-detect',
      gap: args.gap ? design.snapToGrid(args.gap) : 'auto-detect',
      padding: args.padding ? design.snapToGrid(args.padding) : 'auto-detect',
      designNotes: 'Converting to auto-layout. Direction and gap auto-detected from child positions if not specified.',
    });
  },

  layout_grid(args) {
    return json({
      action: 'apply_grid',
      nodeId: args.nodeId,
      columns: args.columns || 12,
      gutter: design.snapToGrid(args.gutter || 24),
      margin: design.snapToGrid(args.margin || 24),
      type: args.type || 'stretch',
    });
  },

  layout_stack(args) {
    return json({ action: 'stack', nodeId: args.nodeId, direction: args.direction, gap: design.snapToGrid(args.gap || 8), align: args.align || 'start' });
  },

  layout_wrap(args) {
    return json({ action: 'wrap_layout', nodeId: args.nodeId, gap: design.snapToGrid(args.gap || 8), maxWidth: args.maxWidth });
  },

  layout_constrain(args) {
    return json({ action: 'set_constraints', nodeId: args.nodeId, horizontal: args.horizontal, vertical: args.vertical, minWidth: args.minWidth, maxWidth: args.maxWidth, minHeight: args.minHeight, maxHeight: args.maxHeight });
  },

  layout_align(args) {
    return json({ action: 'align', nodeIds: args.nodeIds, alignment: args.alignment });
  },

  layout_nest(args) {
    return json({ action: 'restructure_to_autolayout', nodeId: args.nodeId, maxDepth: args.depth || 3, designNotes: 'Analyzing spatial relationships to build auto-layout tree. Groups detected by proximity and alignment.' });
  },

  // ═══ TYPOGRAPHY ═══
  type_scale(args) {
    if (args.action === 'generate') {
      const result = design.generateTypeScale(args.baseSize || 16, args.scaleRatio || 'major-third');
      return json({ action: 'type_scale_generated', ...result });
    }
    return json({ action: 'detect_type_scale', nodeId: args.nodeId, designNotes: 'Scanning all text nodes to detect current scale ratio.' });
  },

  type_hierarchy(args) {
    const scale = design.generateTypeScale(args.baseSize || 16, 'major-third', { down: 1, up: args.levels || 4 });
    return json({ action: 'apply_hierarchy', nodeId: args.nodeId, levels: scale.sizes.map(s => ({ label: s.label, size: s.size, lineHeight: design.getLineHeight(s.size), weight: s.step >= 1 ? 700 : s.step === 0 ? 400 : 400 })) });
  },

  type_pair(args) {
    const pairs = [
      { heading: 'Instrument Serif', body: 'Sora', style: 'editorial' },
      { heading: 'Space Grotesk', body: 'IBM Plex Sans', style: 'technical' },
      { heading: 'Fraunces', body: 'Commissioner', style: 'classic' },
      { heading: 'Cabinet Grotesk', body: 'Satoshi', style: 'modern' },
      { heading: 'Gloock', body: 'DM Sans', style: 'playful' },
    ];
    const match = args.style ? pairs.find(p => p.style === args.style) : pairs[0];
    return json({ suggestions: pairs, recommended: match || pairs[0] });
  },

  type_measure(args) {
    return json({ action: 'check_measure', nodeId: args.nodeId, optimalRange: '45-75 characters', designNotes: 'Measuring character count per line and checking line-height ratios.' });
  },

  type_apply(args) {
    return json({ action: 'apply_text_styles', nodeId: args.nodeId, styles: args.styles });
  },

  type_audit(args) {
    return json({ action: 'audit_typography', nodeId: args.nodeId, designNotes: 'Scanning all text nodes for unique styles. Will flag off-scale sizes and inconsistent weights.' });
  },

  // ═══ COLOR ═══
  color_palette(args) {
    const palette = design.generatePalette(args.baseColor, args.steps);
    return json({ action: 'palette_generated', baseColor: args.baseColor, shades: palette });
  },

  color_semantic(args) {
    const colors = design.generateSemanticColors(args.brandColor);
    return json({ action: 'semantic_colors_generated', ...colors });
  },

  color_darkmode(args) {
    if (args.colors) return json({ action: 'dark_mode_generated', colors: design.generateDarkMode(args.colors) });
    return json({ action: 'generate_dark_mode', nodeId: args.nodeId, designNotes: 'Reading frame colors and generating dark mode with preserved contrast.' });
  },

  color_contrast(args) {
    if (args.foreground && args.background) {
      return json({ action: 'contrast_checked', ...design.checkContrast(args.foreground, args.background) });
    }
    return json({ action: 'audit_contrast', nodeId: args.nodeId, designNotes: 'Checking all text/background pairs in frame.' });
  },

  color_apply(args) {
    return json({ action: 'apply_colors', nodeId: args.nodeId, colorMap: args.colorMap });
  },

  style_shadow(args) {
    const shadows = design.generateElevation(args.levels);
    return json({ action: 'elevation_generated', shadows });
  },

  style_radius(args) {
    const scale = design.generateRadiusScale(args.base || 4);
    return json({ action: 'radius_scale_generated', scale, nodeId: args.nodeId });
  },

  // ═══ COMPONENTS ═══
  component_list(args) { return json({ action: 'list_components', source: args.source || 'file', filter: args.filter }); },
  component_use(args) { return json({ action: 'instantiate_component', componentName: args.componentName, variants: args.variants, position: { x: args.x || 0, y: args.y || 0 } }); },
  component_create(args) { return json({ action: 'create_component', nodeId: args.nodeId, name: args.name, variants: args.variants }); },
  component_swap(args) { return json({ action: 'swap_component', nodeId: args.nodeId, from: args.fromComponent, to: args.toComponent }); },
  component_detach(args) { return json({ action: 'detach_instance', nodeId: args.nodeId }); },
  component_audit(args) { return json({ action: 'audit_components', nodeId: args.nodeId }); },

  // ═══ SPACING ═══
  spacing_scale(args) {
    const scale = design.generateSpacingScale(args.base || 8, args.steps || 12);
    return json({ action: 'spacing_scale_generated', base: args.base || 8, scale });
  },

  spacing_fix(args) {
    return json({ action: 'fix_spacing', nodeId: args.nodeId, base: args.base || 8, designNotes: 'Snapping all padding, margin, and gap values to nearest grid multiple.' });
  },

  spacing_audit(args) {
    return json({ action: 'audit_spacing', nodeId: args.nodeId, base: args.base || 8 });
  },

  spacing_rhythm(args) {
    return json({ action: 'check_rhythm', nodeId: args.nodeId, designNotes: 'Measuring vertical gaps between sections and checking for proportional consistency.' });
  },

  grid_apply(args) {
    return json({ action: 'apply_grid', nodeId: args.nodeId, type: args.type, count: args.count || 12, gutter: design.snapToGrid(args.gutter || 24), margin: design.snapToGrid(args.margin || 24) });
  },

  grid_check(args) {
    return json({ action: 'check_grid_alignment', nodeId: args.nodeId });
  },

  // ═══ AUDIT ═══
  audit_full(args) { return json({ action: 'full_audit', nodeId: args.nodeId, categories: ['spacing', 'typography', 'color', 'components', 'accessibility', 'hierarchy'] }); },
  audit_hierarchy(args) { return json({ action: 'audit_hierarchy', nodeId: args.nodeId }); },
  audit_consistency(args) { return json({ action: 'audit_consistency', nodeId: args.nodeId }); },
  audit_alignment(args) { return json({ action: 'audit_alignment', nodeId: args.nodeId, tolerance: args.tolerance || 2 }); },
  audit_density(args) { return json({ action: 'audit_density', nodeId: args.nodeId }); },

  audit_score(args) {
    return json({ action: 'compute_score', nodeId: args.nodeId, designNotes: 'Computing 0-100 score weighted: spacing 25%, typography 20%, color 15%, components 15%, accessibility 15%, hierarchy 10%.' });
  },

  // ═══ ACCESSIBILITY ═══
  a11y_contrast(args) {
    if (!args.nodeId) return json({ action: 'check_contrast_global', level: args.level || 'aa' });
    return json({ action: 'check_contrast', nodeId: args.nodeId, level: args.level || 'aa' });
  },

  a11y_touch(args) { return json({ action: 'check_touch_targets', nodeId: args.nodeId, minSize: args.minSize || 44 }); },
  a11y_focus(args) { return json({ action: 'generate_focus_states', nodeId: args.nodeId, color: args.color || '#2563eb', offset: args.offset || 2 }); },
  a11y_labels(args) { return json({ action: 'check_labels', nodeId: args.nodeId }); },
  a11y_fix(args) { return json({ action: 'auto_fix_a11y', nodeId: args.nodeId, fixes: args.fixes || ['contrast', 'touch', 'focus'] }); },

  // ═══ RESPONSIVE ═══
  responsive_variant(args) {
    const breakpoints = args.breakpoints || [375, 768, 1440];
    return json({ action: 'generate_variants', nodeId: args.nodeId, breakpoints: breakpoints.map(w => ({ width: w, name: w <= 375 ? 'mobile' : w <= 768 ? 'tablet' : 'desktop' })) });
  },

  responsive_reflow(args) { return json({ action: 'reflow', nodeId: args.nodeId, targetWidth: args.targetWidth }); },
  responsive_breakpoints(args) {
    const widths = args.widths || [375, 768, 1024, 1440];
    return json({ action: 'setup_breakpoints', frames: widths.map(w => ({ width: w, height: args.height || 900, name: design.BREAKPOINTS[w <= 375 ? 'mobile' : w <= 768 ? 'tablet' : 'desktop']?.name || `${w}px` })) });
  },
  responsive_check(args) { return json({ action: 'check_responsive', nodeId: args.nodeId }); },

  // ═══ EXPORT ═══
  export_tokens_css(args) {
    const tokens = buildTokenSet(args);
    return text(exporter.exportCSS(tokens));
  },
  export_tokens_tailwind(args) {
    const tokens = buildTokenSet(args);
    return text(exporter.exportTailwind(tokens));
  },
  export_tokens_json(args) {
    const tokens = buildTokenSet(args);
    return text(exporter.exportW3CTokens(tokens));
  },
  export_tokens_scss(args) {
    const tokens = buildTokenSet(args);
    return text(exporter.exportSCSS(tokens));
  },
  export_spec(args) { return json({ action: 'generate_spec', nodeId: args.nodeId, format: args.format || 'markdown' }); },
  export_changelog(args) { return json({ action: 'diff_frames', nodeIdA: args.nodeIdA, nodeIdB: args.nodeIdB, format: args.format || 'markdown' }); },
};

// ─── Helpers ───

function hexToFigmaColor(hex) {
  const { r, g, b } = design.hexToRgb(hex);
  return { r: r / 255, g: g / 255, b: b / 255 };
}

function getDefaultSections(pageType) {
  const defaults = {
    landing:   ['header', 'hero', 'features', 'testimonials', 'cta', 'footer'],
    pricing:   ['header', 'hero', 'pricing', 'faq', 'cta', 'footer'],
    dashboard: ['sidebar', 'header', 'stats', 'table'],
    settings:  ['sidebar', 'header', 'form'],
    auth:      ['hero', 'form'],
    blog:      ['header', 'hero', 'cards', 'footer'],
    portfolio: ['header', 'hero', 'cards', 'cta', 'footer'],
    docs:      ['sidebar', 'header', 'content'],
  };
  return defaults[pageType] || defaults.landing;
}

function buildTokenSet(args) {
  return {
    colors: design.generateSemanticColors(args.brandColor || '#6366f1'),
    spacing: design.generateSpacingScale(8, 8),
    fontSizes: design.generateTypeScale(16, 'major-third').sizes,
    radii: design.generateRadiusScale(4),
    shadows: design.generateElevation(),
  };
}
