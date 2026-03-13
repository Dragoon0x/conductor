# conductor-figma

Design-intelligent MCP server for Figma. 123 tools across 10 categories. Every tool has built-in design intelligence — 8px grid, type scales, semantic colors, accessibility checks, component defaults. Not a shape proxy. A design engine.

```
npx conductor-figma
```

## What makes this different

**Figsor** has 45 tools that proxy shapes. You tell it "create a rectangle at 43px with 7px padding" and it does exactly that — even though those values are wrong.

**Conductor** has 123 tools with design intelligence. You say "create a button" and it knows: 44px height (touch target), 20px horizontal padding (8px grid), 10px radius, 15px Semi Bold text. Every value is intentional.

## Setup

### 1. Figma Plugin

```
git clone https://github.com/dragoon0x/conductor.git
```

In Figma: **Plugins → Development → Import plugin from manifest** → select `conductor/figma-plugin/manifest.json`

### 2. Add to Cursor / Claude Code

```json
{
  "mcpServers": {
    "conductor": {
      "command": "npx",
      "args": ["-y", "conductor-figma"]
    }
  }
}
```

### 3. Design

Open Figma → Run the Conductor plugin → Chat in Cursor:

> "Create a mobile login screen with email and password fields"

> "Design a dashboard with sidebar, KPI cards, and chart area"

> "Audit the accessibility of my current selection"

> "Export this frame as React + Tailwind code"

## 123 Tools in 10 Categories

### Create & Layout (13)
create_frame, create_text, create_rectangle, create_ellipse, create_line, create_svg_node, create_component, create_component_instance, create_component_set, create_smart_component, set_auto_layout, create_section, create_page

### Modify & Style (25)
modify_node, set_fill (solid + gradients), set_stroke, set_effects (shadows + blur), set_image_fill, style_text_range, set_constraints, delete_node, move_to_parent, duplicate_node, group_nodes, ungroup_nodes, resize_node, align_nodes, set_corner_radius, set_opacity, set_blend_mode, set_clip_content, rename_node, lock_node, set_visibility, reorder_node, set_layout_sizing, flatten_node, set_rotation

### Vector & Shape (8)
create_vector, boolean_operation, create_polygon, create_star, offset_path, create_arrow, create_icon (35 built-in icons), create_divider

### Read & Inspect (18)
get_selection, get_page_structure, get_node_info, get_nodes_info, find_nodes, get_local_styles, get_local_variables, list_components, list_pages, get_document_info, set_selection, set_focus, get_annotations, set_annotation, list_available_fonts, read_node_css, get_selection_colors, measure_distance

### Variables & Tokens (10)
create_variable_collection, create_variable, bind_variable, get_variables, update_variable, delete_variable, create_design_tokens, import_tokens, export_tokens, swap_mode

### Export & Code (10)
export_as_svg, export_as_png, export_to_react, export_design_specs, export_assets, screenshot, copy_css, generate_stylesheet, export_color_palette, export_typography

### Accessibility & Lint (12)
audit_accessibility, check_contrast, fix_touch_targets, lint_design, fix_spacing, check_naming, suggest_improvements, validate_component, check_consistency, generate_a11y_report, color_blindness_check, responsive_check

### Batch Operations (12)
batch_rename, batch_style, batch_replace_text, batch_replace_color, batch_resize, batch_align, batch_delete, batch_duplicate, batch_set_visibility, batch_lock, select_all_by_type, clean_hidden_layers

### Design System (10)
scan_design_system, create_style_guide, detect_inconsistencies, normalize_design, extract_components, get_design_craft_guide, suggest_color_palette, suggest_type_scale, import_design_system, compare_to_system

### Responsive (5)
create_responsive_variant, set_breakpoint, convert_to_responsive, generate_mobile, stack_for_mobile

## Design Intelligence

Every tool queries the intelligence engine:

- **8px Grid**: All spacing values snapped to 8px grid
- **Type Scale**: Mathematical ratios (Major Second, Perfect Fourth, Golden)
- **Semantic Colors**: Full palette from one brand color (dark + light)
- **Component Defaults**: 18 component types with size variants
- **Accessibility**: WCAG AA/AAA contrast checking, 44px touch targets
- **Font Weights**: Auto-resolves "bold" → "Bold", "600" → "Semi Bold"
- **Layout Intelligence**: 13 layout presets (row, column, center, spread, grid, sidebar, form)

## vs Competition

| Feature | Conductor | Figsor | Framelink | Official Figma |
|---------|-----------|--------|-----------|---------------|
| Tools | 123 | 45 | 5 | 12 |
| Design intelligence | Yes | No | No | No |
| Smart components | Yes | No | No | No |
| Accessibility audit | Yes | No | No | No |
| Code export | Yes | No | No | Partial |
| Batch operations | 12 tools | No | No | No |
| Design system scan | Yes | No | No | Partial |
| Responsive tools | 5 tools | No | No | No |
| Design linting | Yes | No | No | No |
| 8px grid enforcement | Yes | No | No | No |

## Disclaimer

Experimental software. DYOR.

## License

MIT. Built by [0xDragoon](https://github.com/dragoon0x).
