# Bot Definition System

## Overview

Every bot in DeepFish is defined by a single JSON file. This file contains **everything** the bot needs:

- Personality & speaking style
- Appearance & colors
- Items (accoutrements)
- UI components
- AI configuration

## File Structure

```
v2/server/world/bots/
├── mei.json          ← Mei's complete definition
├── vesper.json       ← Vesper's complete definition
├── hanna.json        ← Hanna's complete definition
└── ...
```

## Bot JSON Schema

```json
{
  "id": "bot-id",
  "name": "Bot Name",
  "title": "Bot Title/Role",
  "description": "Brief description",
  
  "personality": {
    "traits": ["trait1", "trait2"],
    "speakingStyle": "How they talk",
    "catchphrases": ["phrase1", "phrase2"],
    "emotes": {
      "happy": "description",
      "thinking": "description"
    }
  },
  
  "appearance": {
    "description": "Physical description",
    "colors": ["color1", "color2"],
    "avatar": "filename.png",
    "style": "style-name"
  },
  
  "items": [
    {
      "id": "item-id",
      "name": "Item Name",
      "description": "Item description",
      "mudText": {
        "examine": "What you see in CLI",
        "use": "What happens when used"
      },
      "ui": {
        "component": "ReactComponentName",
        "props": { ... },
        "style": { ... }
      }
    }
  ],
  
  "ai": {
    "model": "gemini-2.0-flash-exp",
    "systemPrompt": "You are...",
    "temperature": 0.7,
    "maxTokens": 2048
  },
  
  "location": {
    "defaultRoom": "lobby",
    "canMove": true
  }
}
```

## How It Works

### 1. Bot Loading

```typescript
// On startup
await botLoader.loadAll();
// Reads all .json files from bots/ directory
// Creates Bot instances
```

### 2. Hot Reload

```typescript
// Edit mei.json
// Save file
await botLoader.reloadBot('mei');
// Mei instantly updates!
```

### 3. Rendering

**CLI:**
```
> examine mei
Mei - Project Manager
Organized, detail-oriented project manager...
Items: Mei's Clipboard, Mei's Daily Planner
```

**React:**
```tsx
<BotCard
  name="Mei"
  title="Project Manager"
  description="..."
  items={[...]}
/>
```

**VR:**
```
Load 3D model: mei-avatar.glb
Apply colors: purple, pink
Spawn items: clipboard, planner
```

## Adding New Bots

1. Create `newbot.json` in `bots/` directory
2. Fill in all fields
3. Save file
4. Bot automatically loads on next startup
5. Or hot-reload: `botLoader.reloadBot('newbot')`

## Editing Bots

1. Open `mei.json`
2. Edit any field (personality, items, etc.)
3. Save file
4. Hot-reload or restart

**No code changes needed!**

## Item System

Each bot can have unlimited items. Items have:

- **MUD text** (for CLI)
- **UI component** (for React/VR)
- **Props** (data for the component)

Example: Mei's Clipboard shows project list in CLI as text, but renders as interactive Kanban board in React!

## Benefits

✅ **Single source of truth** - one file per bot
✅ **Hot-swappable** - edit and reload instantly
✅ **No code changes** - pure data
✅ **Renderer agnostic** - works with CLI, React, VR
✅ **Easy to version control** - just JSON files
✅ **Easy to backup** - copy the files
✅ **Easy to share** - send someone a bot JSON

## Future: Bot Marketplace?

Since bots are just JSON files, you could:
- Share bots with other users
- Download community bots
- Create bot packs
- Version bots (mei-v1.json, mei-v2.json)

**The possibilities are endless!** 🚀
