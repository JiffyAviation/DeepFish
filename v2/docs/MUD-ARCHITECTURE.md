# DeepFish MUD/MUSH Architecture

## Standard MUD Server Components

### 1. **The Database (World)**
Traditional MUD: Flat files or simple DB
DeepFish: `server/world/` directory
- Rooms, objects, NPCs defined as data
- Loaded on startup
- Persisted on change

### 2. **The Parser (Command Interpreter)**
Traditional MUD: Text parser
DeepFish: `mudCLI.ts` handles commands
- Parses user input
- Routes to appropriate handler
- Returns structured output

### 3. **The Event System (Heartbeat)**
Traditional MUD: Game loop
DeepFish: `eventBus.ts`
- All actions are events
- Components subscribe to events
- Decoupled architecture

### 4. **The Output Formatter (Renderer)**
Traditional MUD: ANSI codes, MXP tags
DeepFish: **Structured JSON output**
- CLI renders as text
- React renders as components
- VR renders as 3D

## Structured Output Protocol

Every output follows this format:

```typescript
interface MudOutput {
  type: 'room' | 'message' | 'error' | 'system';
  data: any;
  timestamp: Date;
}
```

### Example Outputs:

**Room Description:**
```json
{
  "type": "room",
  "data": {
    "id": "lobby",
    "name": "The Lobby",
    "description": "A sleek, modern lobby...",
    "exits": [
      { "id": "conference", "name": "Conference Room" }
    ],
    "occupants": [
      { "id": "admin", "type": "player" },
      { "id": "vesper", "type": "npc" }
    ]
  }
}
```

**Message:**
```json
{
  "type": "message",
  "data": {
    "speaker": "Vesper",
    "text": "Welcome to DeepFish Tower!",
    "emote": "smiles"
  }
}
```

**System Alert:**
```json
{
  "type": "system",
  "data": {
    "priority": "warning",
    "message": "Conference Room will be closed for maintenance at 14:00"
  }
}
```

## How Renderers Work

### CLI Renderer:
```typescript
function renderCLI(output: MudOutput): string {
  switch (output.type) {
    case 'room':
      return `
${output.data.name}
${output.data.description}

Exits: ${output.data.exits.map(e => e.name).join(', ')}
`;
    case 'message':
      return `${output.data.speaker} says: ${output.data.text}`;
  }
}
```

### React Renderer:
```tsx
function renderReact(output: MudOutput): JSX.Element {
  switch (output.type) {
    case 'room':
      return <RoomCard room={output.data} />;
    case 'message':
      return <ChatBubble speaker={output.data.speaker} 
                         text={output.data.text} />;
  }
}
```

### VR Renderer:
```typescript
function renderVR(output: MudOutput): void {
  switch (output.type) {
    case 'room':
      loadScene(output.data.id);
      spawnNPCs(output.data.occupants);
      break;
    case 'message':
      showSpeechBubble(output.data.speaker, output.data.text);
      break;
  }
}
```

## File Organization (MUD Standard)

```
v2/
├── server/
│   ├── world/           # The Database
│   │   ├── rooms/       # Room definitions
│   │   ├── npcs/        # NPC definitions
│   │   └── items/       # Item definitions
│   ├── commands/        # The Parser
│   │   ├── look.ts
│   │   ├── go.ts
│   │   └── say.ts
│   ├── utils/
│   │   ├── eventBus.ts  # The Event System
│   │   └── output.ts    # The Output Formatter
│   └── mudCLI.ts        # CLI Renderer
├── client/
│   ├── react/           # React Renderer
│   └── vr/              # VR Renderer (future)
```

## Benefits of This Approach

1. **Single Source of Truth**: World data is separate from rendering
2. **Renderer Agnostic**: Same data, infinite UIs
3. **Future Proof**: Add new renderers without touching core
4. **Testable**: Test logic without UI
5. **Proven**: 40+ years of MUD architecture

## Migration Path

**Phase 1** (Done): CLI with basic structured output
**Phase 2** (Next): Formalize output protocol
**Phase 3**: Build React renderer
**Phase 4**: Build VR renderer

---

**This is the MUD way.** The server doesn't know or care how you render. It just sends structured data.
