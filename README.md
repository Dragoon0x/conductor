# conductor-figma

Design-intelligent MCP server for Figma. 201 tools across 17 categories. Every tool has built-in design intelligence — 8px grid, type scales, semantic colors, accessibility checks, component defaults. Not a shape proxy. A design engine.

```
npx conductor-figma
```

## What makes this different


**Conductor** has 201 tools with design intelligence. You say "create a button" and it knows: 44px height (touch target), 20px horizontal padding (8px grid), 10px radius, 15px Semi Bold text. Every value is intentional.

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

## 201 Tools in 17 Categories

| Category | Count | Highlights |
|----------|-------|-----------|
| Create & Layout | 20 | Frames, text, shapes, smart components (18 types), sections, pages, forms, tables, nav bars, cards, sidebars |
| Modify & Style | 25 | Fills (solid + gradients), strokes, effects, image fills, text ranges, constraints, transforms |
| Vector & Shape | 8 | Paths, booleans, polygons, stars, 35 built-in icons, arrows, dividers |
| Read & Inspect | 18 | Selection, page tree, node info, search, CSS export, fonts, annotations, measurements |
| Variables & Tokens | 10 | Collections, modes, binding, W3C import/export, full token system from brand color |
| Export & Code | 12 | React + Tailwind, HTML, Vue, Svelte, SVG, PNG, design specs, stylesheets, palettes |
| Accessibility & Lint | 12 | WCAG audit, contrast, touch targets, font sizes, color blindness, design lint, compliance reports |
| Batch Operations | 17 | Rename patterns, bulk style, find/replace text/color, clean hidden layers, round values, set fonts |
| Design System | 10 | Scan, extract, normalize, lint, style guide, palette, type scale, import/export |
| Responsive | 5 | Mobile/tablet/desktop variants, breakpoints, stacking, responsive conversion |
| Typography | 10 | Type scale, audit, hierarchy, measure, normalize, font replace, pairing, styles |
| Color | 10 | Palette generation, harmonies, dark/light mode, contrast check, semantic systems |
| Prototype | 10 | Links, transitions, overlays, scroll, hover states, flows, fixed position |
| Page Management | 8 | Create, switch, duplicate, delete, rename, sort, merge, overview |
| Library | 8 | Search, swap, detach, audit, batch swap, publish |
| Annotation & Handoff | 10 | Spacing redlines, color swatches, typography specs, spec sheets, changelogs |
| Effects & Styles | 8 | Glassmorphism, neumorphism, noise, gradients, shadow systems, border gradients |

## Design Intelligence

Every tool queries the intelligence engine:

- **8px Grid**: All spacing values snapped to 8px grid
- **Type Scale**: 7 mathematical ratios (Minor Second through Golden Ratio)
- **Semantic Colors**: Full palette from one brand color (dark + light modes)
- **Component Defaults**: 18 component types with size variants (button, input, card, avatar, badge, chip, switch, checkbox, radio, toast, tooltip, modal, dropdown, tabs, table, progress, skeleton, divider)
- **Accessibility**: WCAG AA/AAA contrast, 44px touch targets, font minimums, color blindness
- **Font Weights**: Auto-resolves "bold" → "Bold", "600" → "Semi Bold"
- **Layout Intelligence**: 13 layout presets (row, column, center, spread, grid, sidebar, form)

## License

MIT. Built by [0xDragoon](https://github.com/dragoon0x).

## Disclaimer

**This software is provided strictly for educational and experimental purposes only.** Do your own research (DYOR) before using in any production environment.

- This is experimental, open-source software provided "as-is" with **absolutely no warranties, representations, or guarantees of any kind** — express, implied, or statutory — including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, reliability, or non-infringement.
- The author(s), contributor(s), and maintainer(s) of this project — including the individual known as 0xDragoon — **shall not be held liable** for any direct, indirect, incidental, special, consequential, or punitive damages, losses, costs, or expenses arising from or related to the use, misuse, inability to use, or reliance upon this software, including but not limited to loss of data, loss of revenue, business interruption, or damages to Figma files, design assets, or any other digital property.
- This software interacts with third-party services (Figma, Cursor, Claude Code) over which the author has no control. The author assumes **no responsibility** for any changes, outages, API modifications, or policy updates by these third parties that may affect the functionality of this software.
- No data collection, telemetry, or analytics are performed by this software. All operations run locally between your machine and the Figma desktop application. However, the author makes **no guarantees** regarding data security, privacy, or confidentiality.
- This software is **not affiliated with, endorsed by, or sponsored by** Figma, Inc., Anthropic, PBC, Anysphere (Cursor), or any other company or organization.
- Users are solely responsible for ensuring their use of this software complies with all applicable laws, regulations, terms of service, and licensing agreements — including Figma's Terms of Service and API usage policies.
- **Use at your own risk.** Always back up your Figma files before running any automated operations. The author is not responsible for any unintended modifications, deletions, or corruption of design files.

MIT License · Copyright © 2025 0xDragoon
