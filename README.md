# CONDUCTOR

> Experimental software. DYOR. Use at your own risk.

Design-intelligent MCP server for Figma. 61 tools across 10 categories. It doesn't place shapes — it designs. 8px grid, type scale ratios, auto-layout, component reuse, WCAG accessibility, and a self-auditing design score. Every decision follows the rules a senior designer applies instinctively.

```
npx conductor-figma
```

## What it does

Other MCP servers translate your words into shapes. CONDUCTOR translates them into design decisions.

Say "create a pricing page." A typical MCP creates rectangles with absolute positioning, random font sizes, and arbitrary spacing. CONDUCTOR creates a page with auto-layout frames, a type scale following a major third ratio (1.25), spacing on an 8px grid, and proper visual hierarchy — headings are dominant, body text recedes, CTAs are prominent.

## Setup

Install the CONDUCTOR plugin from the Figma Community. Then add to your editor:

```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "conductor": {
      "command": "npx",
      "args": ["-y", "conductor-figma"]
    }
  }
}
```

Open your Figma file, run the plugin, then chat:

```
"Create a SaaS landing page with hero, features, and pricing"
"Audit this frame — is my spacing consistent?"
"Generate a dark mode variant of this page"
"Convert these absolute-positioned layers to auto-layout"
```

## 61 Tools · 10 Categories

### Create (8)
| Tool | Description |
|------|-------------|
| `create_frame` | Auto-layout frame with grid-aligned spacing |
| `create_page` | Full page from intent: landing, pricing, dashboard |
| `create_section` | Hero, features, testimonials, FAQ, CTA — pattern-aware |
| `create_card` | Card with proper padding, radius, shadow, hierarchy |
| `create_form` | Form with labels, inputs, validation, submit flow |
| `create_table` | Data table with header, rows, sorting, pagination |
| `create_modal` | Modal with overlay, sizing, and action buttons |
| `create_nav` | Topbar, sidebar, breadcrumbs, tabs — with states |

### Layout (7)
| Tool | Description |
|------|-------------|
| `layout_auto` | Convert any frame to auto-layout |
| `layout_grid` | Apply column grid: 12-col, 8-col, custom |
| `layout_stack` | Stack children with consistent spacing |
| `layout_wrap` | Wrap-layout for tags, pills, flexible grids |
| `layout_constrain` | Set fill, hug, fixed, min/max constraints |
| `layout_align` | Align and distribute frames on the grid |
| `layout_nest` | Restructure flat layers into auto-layout tree |

### Typography (6)
| Tool | Description |
|------|-------------|
| `type_scale` | Generate or detect type scale ratios |
| `type_hierarchy` | Set heading levels with proper ratios |
| `type_pair` | Font pairing suggestions |
| `type_measure` | Check line length and readability |
| `type_apply` | Bulk-apply text styles |
| `type_audit` | Find off-scale sizes and inconsistencies |

### Color & Style (7)
| Tool | Description |
|------|-------------|
| `color_palette` | Generate 50-950 shades from one color |
| `color_semantic` | Create semantic tokens |
| `color_darkmode` | Generate dark mode with preserved contrast |
| `color_contrast` | WCAG AA/AAA contrast checking |
| `color_apply` | Apply colors by semantic role |
| `style_shadow` | Generate elevation system |
| `style_radius` | Generate radius scale |

### Components (6)
| Tool | Description |
|------|-------------|
| `component_list` | List components in file or library |
| `component_use` | Instantiate with variant props |
| `component_create` | Create component from frame |
| `component_swap` | Swap instances across a frame |
| `component_detach` | Detach instances to editable frames |
| `component_audit` | Find missing/unused/detached components |

### Spacing & Grid (6)
| Tool | Description |
|------|-------------|
| `spacing_scale` | Generate spacing scale from base unit |
| `spacing_fix` | Snap off-grid values to nearest grid |
| `spacing_audit` | Report all spacing values, flag issues |
| `spacing_rhythm` | Check vertical rhythm consistency |
| `grid_apply` | Apply layout grid to a frame |
| `grid_check` | Verify children align to grid |

### Audit & Critique (6)
| Tool | Description |
|------|-------------|
| `audit_full` | Full design audit across all categories |
| `audit_hierarchy` | Check visual hierarchy |
| `audit_consistency` | Find elements with inconsistent styles |
| `audit_alignment` | Flag misaligned elements |
| `audit_density` | Check information density |
| `audit_score` | 0-100 design health score |

### Accessibility (5)
| Tool | Description |
|------|-------------|
| `a11y_contrast` | WCAG AA/AAA contrast checking |
| `a11y_touch` | 44x44px touch target verification |
| `a11y_focus` | Generate focus ring styles |
| `a11y_labels` | Check for missing labels |
| `a11y_fix` | Auto-fix: contrast, targets, focus |

### Responsive (4)
| Tool | Description |
|------|-------------|
| `responsive_variant` | Generate mobile/tablet/desktop variants |
| `responsive_reflow` | Reflow desktop to mobile |
| `responsive_breakpoints` | Set up breakpoint frames |
| `responsive_check` | Verify overflow and targets |

### Export & Handoff (6)
| Tool | Description |
|------|-------------|
| `export_tokens_css` | CSS custom properties |
| `export_tokens_tailwind` | Tailwind config extension |
| `export_tokens_json` | W3C Design Tokens format |
| `export_tokens_scss` | SCSS variables |
| `export_spec` | Design spec with measurements |
| `export_changelog` | Diff two frames |

## Design Intelligence

Every tool is backed by real design logic, not arbitrary values.

**8px Grid**: All spacing values snap to the nearest multiple of 8. Padding, margins, gaps — no 13px, no 27px, no arbitrary numbers.

**Type Scale Ratios**: Font sizes follow mathematical ratios. Minor third (1.2), major third (1.25), perfect fourth (1.333), golden ratio (1.618). Headings, body, captions all relate to each other.

**Auto-Layout**: Every frame uses Figma auto-layout with proper direction, gap, padding, and alignment. Zero absolute positioning.

**WCAG Accessibility**: Contrast checking against AA (4.5:1) and AAA (7:1). Touch target verification (44x44px minimum). Focus state generation.

**Design Score**: 0-100 health score weighted across spacing (25%), typography (20%), color (15%), components (15%), accessibility (15%), hierarchy (10%).

## Programmatic API

```js
import { generateTypeScale, checkContrast, auditSpacing, snapToGrid } from 'conductor-figma'

const scale = generateTypeScale(16, 'major-third')
// → { scale: 'Major Third', ratio: 1.25, sizes: [...] }

const contrast = checkContrast('#333333', '#ffffff')
// → { ratio: 12.63, aa: true, aaa: true }

const audit = auditSpacing([8, 13, 16, 22, 32], 8)
// → { adherence: 0.6, fixes: [{ from: 13, to: 16 }, { from: 22, to: 24 }] }
```

## CLI

```bash
conductor-figma --list        # List all 61 tools
conductor-figma --categories  # Show categories
conductor-figma --help        # Help
conductor-figma               # Start MCP server (stdio)
```

## Zero Dependencies

CONDUCTOR has no runtime dependencies. Pure JavaScript. The design intelligence engine runs locally — no API calls, no external services.

## Disclaimer

Experimental, open-source software. Provided as-is with no warranties. DYOR. Use at your own risk. The author assumes zero liability.

## License

MIT. Built by 0xDragoon.
