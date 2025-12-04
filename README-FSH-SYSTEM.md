# DeepFish AI Studio - Fish Skill (.fsh) Agent System

## Version 2.0 Architecture Update

### What's New

**Fish Skill (.fsh) system** - Revolutionary AI agent management:
- **Portable**: Self-contained agent files
- **Sellable**: Distribute as standalone products  
- **Trainable**: User customization without breaking factory settings
- **Modular**: Drop-in/drop-out management

### Dual-File System

Each agent = TWO files:
- **`agent.fsh`** - Factory (DeepFish property, read-only)
- **`agent.user.json`** - User training (user property, read-write)

Merge at **runtime only** - never blended on disk.

### Agent Directory

Development: `/agents/` folder in repo
User Install: `C:\DeepFish\` (all agents in flat structure)

### Key Files

- `services/agentLoader.ts` - .fsh loading system
- `agentTypes.ts` - Type definitions
- `agents/hanna.fsh` - Example factory file
- `agents/hanna.user.json` - Example user training

### Usage

```typescript
import { AgentLoader } from './services/agentLoader';

const loader = new AgentLoader();
const agents = await loader.loadAllAgents();
await loader.trainAgent('hanna', content, 'pdf');
await loader.resetAgent('hanna'); // Factory reset
```

### Legal

- `.fsh` = DeepFish property
- `.user.json` = User property/responsibility
- Training materials = Ephemeral (never stored)
- Users backup their own training data

---

**DeepFish AI Studio** - Boutique AI Design House
