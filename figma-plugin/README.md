# CONDUCTOR — Figma Plugin

Design-intelligent MCP bridge for Figma. Connects your AI editor (Cursor, Claude Code, Copilot) to Figma via the CONDUCTOR MCP server. 61 design-aware tools. Zero shape-proxying.

## How it works

```
AI Editor ──→ MCP Server ──→ WebSocket ──→ This Plugin ──→ Figma API
 (Cursor)   (conductor-figma)   (localhost)   (CONDUCTOR)    (your canvas)
```

1. The MCP server (`conductor-figma`) runs on your machine
2. This plugin opens a WebSocket connection to it
3. Your AI editor sends design commands through MCP
4. The plugin executes them on your Figma canvas
5. Results flow back to the AI

## Setup

### 1. Install the MCP server

```bash
npm install -g conductor-figma
```

### 2. Add to your editor

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

### 3. Run the plugin

1. Open a Figma file
2. Run CONDUCTOR from the plugin menu
3. Click **Connect** (default port: 9800)
4. Start chatting in your editor

## What the plugin handles

The plugin is the bridge between the MCP server and Figma's API. It receives structured commands and executes them:

**Create**: Frames, text, rectangles, sections, components — all with auto-layout, grid-aligned spacing, and proper constraints.

**Layout**: Auto-layout conversion, grid application, stacking, alignment, constraint setting.

**Style**: Fill colors, strokes, effects (shadows), corner radius, opacity.

**Typography**: Font loading, text properties, size, weight, alignment, line-height.

**Read**: Node inspection, tree traversal, spacing audit, color extraction, typography scan.

**Edit**: Rename, move, resize, delete, clone, group, ungroup, reorder.

**Export**: PNG (with configurable scale), SVG.

**Viewport**: Zoom to node, scroll to position.

## Plugin UI

The plugin panel shows:

- **Connection status** — green dot when connected, red when disconnected
- **Port config** — WebSocket port (default 9800)
- **Session stats** — commands received, nodes created, nodes edited, errors
- **Activity log** — real-time feed of every command and its result

## File structure

```
conductor-plugin/
├── manifest.json    # Figma plugin manifest
├── code.js          # Sandbox code (Figma API access)
├── ui.html          # Plugin panel UI
└── README.md
```

## Submitting to Figma Community

1. Open Figma Desktop
2. Go to **Plugins → Development → Import plugin from manifest**
3. Select the `manifest.json` file from this folder
4. Test the plugin in a Figma file
5. Go to **Plugins → Development → Manage plugins in development**
6. Click **Publish** on CONDUCTOR
7. Fill in the listing details:
   - **Name**: CONDUCTOR
   - **Description**: Design-intelligent MCP bridge. Connects AI editors to Figma with 61 design-aware tools. 8px grid, type scales, auto-layout, component reuse, accessibility.
   - **Category**: Development
   - **Tags**: ai, mcp, cursor, design-system, auto-layout, accessibility
8. Upload a cover image (1920×960 recommended)
9. Submit for review

## Development

To test locally:

1. In Figma Desktop: **Plugins → Development → Import plugin from manifest**
2. Point to this folder's `manifest.json`
3. The plugin appears in your development plugins
4. Run it from **Plugins → Development → CONDUCTOR**
5. Any changes to `code.js` or `ui.html` take effect after re-running the plugin

## License

MIT. Built by 0xDragoon.
