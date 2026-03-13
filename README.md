# conductor-figma

Design-intelligent MCP server for Figma. 201 tools across 17 categories. Every tool has built-in design intelligence — 8px grid, type scales, semantic colors, accessibility checks, component defaults. Works with Cursor and Claude Code.

```
npx conductor-figma
```

## How to use

### 1. Clone the repo (for the Figma plugin)

```bash
git clone https://github.com/dragoon0x/conductor.git
```

### 2. Import the Figma plugin

Open Figma Desktop:

1. Go to **Plugins → Development → Import plugin from manifest**
2. Navigate to `conductor/figma-plugin/manifest.json`
3. Click **Open**

The plugin is now installed. You only need to do this once.

### 3. Add to Cursor

Open `~/.cursor/mcp.json` and add conductor:

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

Restart Cursor.

### 4. Connect and design

1. Open a Figma file
2. Run the plugin: **Plugins → Development → Conductor**
3. The plugin should show a green dot (Connected)
4. In Cursor chat, type `@conductor` followed by any command

### Example prompts

```
@conductor Create a dark hero section with a big heading and a purple CTA button

@conductor Check contrast between #ffffff and #6366f1

@conductor Create a dashboard layout with sidebar, KPI cards, and chart area

@conductor Audit accessibility on my current selection

@conductor Replace all #6366f1 with #3b82f6 across the file

@conductor Export this frame as React + Tailwind code

@conductor Scan my file and show me all off-grid spacing

@conductor Generate a color palette from #6366f1
```

### Alternative: use local path (faster startup)

Instead of `npx`, point directly to the cloned repo:

```json
{
  "mcpServers": {
    "conductor": {
      "command": "node",
      "args": ["/path/to/conductor/bin/conductor.js"]
    }
  }
}
```

## How it works

```
You type in Cursor → MCP server (stdio) → WebSocket :3055 → Figma plugin → Canvas
```

Cursor starts the MCP server automatically. The server opens a WebSocket on port 3055. The Figma plugin connects to that WebSocket and executes commands on the canvas.

## What makes this different

Other MCP servers for Figma are API wrappers. You give exact pixel values, they obey — even when those values are wrong. Conductor applies design rules before anything touches the canvas.

You say "create a button." A typical MCP makes a rectangle. Conductor makes a 44px-tall frame with 20px horizontal padding, 10px radius, 15px Semi Bold text — because that's what a button actually is.

## 201 tools in 17 categories

### Create & Layout (20)
create_frame, create_text, create_rectangle, create_ellipse, create_line, create_svg_node, create_component, create_component_instance, create_component_set, create_smart_component, set_auto_layout, create_section, create_page, create_table_frame, create_form, create_nav_bar, create_card_grid, create_sidebar_layout, create_footer, create_header

### Modify & Style (25)
modify_node, set_fill, set_stroke, set_effects, set_image_fill, style_text_range, set_constraints, delete_node, move_to_parent, duplicate_node, group_nodes, ungroup_nodes, resize_node, align_nodes, set_corner_radius, set_opacity, set_blend_mode, set_clip_content, rename_node, lock_node, set_visibility, reorder_node, set_layout_sizing, flatten_node, set_rotation

### Vector & Shape (8)
create_vector, boolean_operation, create_polygon, create_star, offset_path, create_arrow, create_icon (35 built-in), create_divider

### Read & Inspect (18)
get_selection, get_page_structure, get_node_info, get_nodes_info, find_nodes, get_local_styles, get_local_variables, list_components, list_pages, get_document_info, set_selection, set_focus, get_annotations, set_annotation, list_available_fonts, read_node_css, get_selection_colors, measure_distance

### Variables & Tokens (10)
create_variable_collection, create_variable, bind_variable, get_variables, update_variable, delete_variable, create_design_tokens, import_tokens, export_tokens, swap_mode

### Export & Code (12)
export_as_svg, export_as_png, export_to_react, export_design_specs, export_assets, screenshot, copy_css, generate_stylesheet, export_color_palette, export_typography, export_component_inventory, export_spacing_tokens

### Accessibility & Lint (12)
audit_accessibility, check_contrast, fix_touch_targets, lint_design, fix_spacing, check_naming, suggest_improvements, validate_component, check_consistency, generate_a11y_report, color_blindness_check, responsive_check

### Batch Operations (17)
batch_rename, batch_style, batch_replace_text, batch_replace_color, batch_resize, batch_align, batch_delete, batch_duplicate, batch_set_visibility, batch_lock, select_all_by_type, clean_hidden_layers, batch_set_font, batch_round_values, batch_remove_strokes, batch_remove_effects, batch_set_corner_radius

### Design System (10)
scan_design_system, create_style_guide, detect_inconsistencies, normalize_design, extract_components, get_design_craft_guide, suggest_color_palette, suggest_type_scale, import_design_system, compare_to_system

### Responsive (5)
create_responsive_variant, set_breakpoint, convert_to_responsive, generate_mobile, stack_for_mobile

### Typography (10)
type_scale_apply, type_audit, type_set_hierarchy, type_check_measure, type_normalize, type_list_styles, type_pair_suggest, type_replace_font, set_text_content, type_create_style

### Color (10)
color_palette_generate, color_extract, color_harmonize, color_darkmode, color_lightmode, color_check_all, color_create_style, color_apply_style, color_replace_global, color_generate_semantic

### Prototype & Interaction (10)
create_prototype_link, create_scroll_behavior, set_overflow, create_overlay, set_fixed_position, create_hover_state, create_flow, list_flows, remove_prototype_link, set_transition

### Page Management (8)
create_new_page, switch_page, duplicate_page, delete_page, rename_page, sort_pages, merge_pages, page_overview

### Library & Components (8)
search_library, list_team_libraries, swap_component, detach_instance, reset_overrides, component_audit, batch_swap_component, publish_components

### Annotation & Handoff (10)
annotate_spacing, annotate_colors, annotate_typography, create_measurement, create_spec_sheet, annotate_grid, annotate_hierarchy, create_component_docs, annotate_responsive, create_changelog

### Effects & Styles (8)
create_glassmorphism, create_neumorphism, create_noise_texture, set_gradient_fill, create_shadow_system, apply_backdrop_blur, create_border_gradient, remove_all_effects

## Design intelligence engine

Every tool queries the intelligence engine before touching Figma:

- **8px Grid** — All spacing values snapped. snap(13) = 16.
- **Type Scale** — 7 ratio presets: Minor Second through Golden Ratio.
- **Semantic Colors** — Full palette from one brand hex. Dark + light modes.
- **Component Defaults** — 18 component types with size variants.
- **Accessibility** — WCAG AA/AAA contrast, 44px touch targets, font minimums.
- **Font Weights** — Auto-resolves "bold" → "Bold", "600" → "Semi Bold".
- **Layout Intelligence** — 13 layout presets: row, column, center, spread, sidebar, grid, form.

## Troubleshooting

**Plugin says "Disconnected"**
The MCP server isn't running. Make sure Cursor is open and conductor is configured in mcp.json. Try sending any @conductor message in Cursor chat — that triggers the server to start.

**Port 3055 already in use**
Kill the old process: `kill $(lsof -t -i :3055) 2>/dev/null` then restart Cursor.

**Cursor shows "Loading tools" forever**
Make sure you have the latest version. Run: `npx conductor-figma@latest`
Or use the local path method for faster startup.

## Disclaimer

**This software is provided strictly for educational and experimental purposes only.** Do your own research (DYOR) before using in any production environment.

- This is experimental, open-source software provided "as-is" with **absolutely no warranties, representations, or guarantees of any kind** — express, implied, or statutory — including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, reliability, or non-infringement.
- The author(s), contributor(s), and maintainer(s) of this project — including the individual known as 0xDragoon — **shall not be held liable** for any direct, indirect, incidental, special, consequential, or punitive damages, losses, costs, or expenses arising from or related to the use, misuse, inability to use, or reliance upon this software, including but not limited to loss of data, loss of revenue, business interruption, or damages to Figma files, design assets, or any other digital property.
- This software interacts with third-party services (Figma, Cursor, Claude Code) over which the author has no control. The author assumes **no responsibility** for any changes, outages, API modifications, or policy updates by these third parties that may affect the functionality of this software.
- No data collection, telemetry, or analytics are performed by this software. All operations run locally between your machine and the Figma desktop application. However, the author makes **no guarantees** regarding data security, privacy, or confidentiality.
- This software is **not affiliated with, endorsed by, or sponsored by** Figma, Inc., Anthropic, PBC, Anysphere (Cursor), or any other company or organization.
- Users are solely responsible for ensuring their use of this software complies with all applicable laws, regulations, terms of service, and licensing agreements — including Figma's Terms of Service and API usage policies.
- **Use at your own risk.** Always back up your Figma files before running any automated operations. The author is not responsible for any unintended modifications, deletions, or corruption of design files.

MIT License · Copyright 2025 0xDragoon
