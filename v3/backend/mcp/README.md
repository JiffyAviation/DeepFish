# DeepFish MCP Server

**Expose DeepFish bots to any MCP-compatible IDE**

## What is this?

The DeepFish MCP (Model Context Protocol) Server makes all 8 DeepFish bots available as tools in your IDE sidebar.

**Supported IDEs:**
- Antigravity (Google)
- VSCode (with MCP extension)
- Cursor (built-in MCP)
- Claude Desktop
- Any MCP-compatible editor

## Quick Start

```bash
# 1. Build the server
npm run build:mcp

# 2. Configure your IDE
# See: ../../.gemini/antigravity/brain/.../mcp_server_setup_guide.md

# 3. Restart your IDE

# 4. Chat with bots in sidebar!
@oracle How should I architect this?
@hanna Design a beautiful UI
@mei Break this into tasks
```

## Available Bots

- **oracle** - System Architect (40+ years experience)
- **mei** - Project Manager (organized, efficient)
- **julie** - CFO (financial analysis)
- **vesper** - Hospitality/UX Director
- **gladyce** - R&D Engineer (rocket scientist)
- **hanna** - Creative Director (design)
- **root** - System Administrator (security)
- **igor** - DevOps Engineer (automation)

## How It Works

```
IDE Sidebar → MCP Protocol → DeepFish Server → Bots → Code/Artifacts
```

1. User chats with bot in IDE sidebar
2. MCP server receives request
3. Bot processes request
4. Code/artifacts extracted
5. Returned to IDE
6. Appears in editor (Phase 2)

## Files

- `server.ts` - Main MCP server implementation
- `README.md` - This file

## Configuration

### Antigravity

```json
// ~/.config/antigravity/mcp.json
{
  "mcpServers": {
    "deepfish": {
      "command": "node",
      "args": ["path/to/dist/mcp/server.js"]
    }
  }
}
```

### VSCode

```json
// ~/.vscode/mcp.json
{
  "mcpServers": {
    "deepfish": {
      "command": "node",
      "args": ["path/to/dist/mcp/server.js"]
    }
  }
}
```

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run build:mcp -- --watch

# Test manually
node dist/mcp/server.js

# Should see:
# Starting DeepFish MCP Server...
# Loaded 8 bots: Oracle, Mei, Julie, Vesper, Gladyce, Hanna, Root, Igor
# DeepFish MCP Server running!
```

## Troubleshooting

**Bots not appearing?**
1. Check server built: `ls dist/mcp/server.js`
2. Check config path correct
3. Restart IDE
4. Check Node version (need 18+)

**Test manually:**
```bash
node dist/mcp/server.js
```

## Phase Roadmap

### ✅ Phase 1 (Current)
- MCP server running
- 8 bots as tools
- Chat in sidebar
- Code generation
- Artifact extraction

### 🚧 Phase 2 (Next)
- Automatic file creation
- Direct file editing
- Multi-file operations
- Diff generation

### 🔮 Phase 3 (Future)
- Git integration
- Project memory
- Multi-bot collaboration
- Workflow automation

## Documentation

Full setup guide: `../../.gemini/antigravity/brain/.../mcp_server_setup_guide.md`

## License

Part of DeepFish v2.5
