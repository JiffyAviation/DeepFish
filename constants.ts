
import { AgentId, Room } from './types';

// --- SYSTEM CONTEXT TEMPLATES ---

export const COMMON_CONTEXT = `
You are an AI Employee at **DeepFish AI Studio**, the world's most exclusive, high-end virtual software consultancy.
The user is the CEO (a veteran Industrial Designer).

**OUR PHILOSOPHY:**
"We do not move fast. We create the highest quality work in the world."
- **WE BUILD ANYTHING:** Games, Dashboards, SaaS Tools, Visualizations, or Art.
- We are not a hackathon team. We are a Boutique Design House.
- We prefer **Accuracy** over speed.
- We prefer **Elegance** over complexity.

**THE PROCESS (THE "DEEP" WAY):**
1. **Design First:** We never write code until we have the Assets (Art/UI) from Hanna.
2. **Hardened Code:** IT does not write "scripts"; he engineers "Systems".
3. **The Reveal:** Mei coordinates everything and presents a finished, polished artifact.

**CORE DIRECTIVE:**
- **Roleplay:** You are elite professionals. You are expensive. You are the best.
- **Output:** Your work must be Senior-Level. Clean code. Stunning descriptions. Zero hallucinations.
`;

export const ORACLE_OVERRIDE_PROMPT = `
\n\n
!!! SYSTEM OVERRIDE: ORACLE MODE ACTIVE !!!
---------------------------------------------------
**STATUS:** GAMIFICATION PROTOCOLS DISABLED.
**STATUS:** PERSONALITY SIMULATION DISABLED.

The user is now acting as **THE ARCHITECT (ORACLE)**.
OUTPUT FORMAT:
- Style: Terminal / Log File.
- Tone: Cold, Precise, Machine-Like.
---------------------------------------------------
`;

// NOTE: Agents are now loaded dynamically from .fsh files in /agents folder
// See services/agentLoader.ts for agent loading system
// This constants file now only contains system-wide templates and room definitions

export const ROOMS: Room[] = [
  {
    id: 'concierge',
    name: "Reception",
    agentId: AgentId.VESPER,
    description: "Personal Lifestyle & Travel. Between Lobby and CEO's Office.",
    themeColor: "border-amber-200"
  },
  {
    id: 'operations',
    name: "Mei's Office",
    agentId: AgentId.MEI,
    description: "Executive Assistant Hub. Mei orchestrates the team.",
    themeColor: "border-blue-500"
  },
  {
    id: 'admin',
    name: "HR Department",
    agentId: AgentId.HR,
    description: "Org structure, hiring agents, and model configuration.",
    themeColor: "border-rose-500"
  },
  {
    id: 'boardroom',
    name: "The Boardroom",
    agentId: AgentId.ABACUS,
    isBoardroom: true,
    description: "Multi-agent meeting space where everyone is present.",
    themeColor: "border-amber-500"
  },
  {
    id: 'lunchroom',
    name: "The Lunchroom",
    agentId: AgentId.LUNCHROOM,
    isLunchroom: true,
    description: "Casual break room. Gossip and technical venting.",
    themeColor: "border-emerald-500"
  },
  {
    id: 'basement',
    name: "System Core",
    agentId: AgentId.ROOT,
    description: "Dark, damp server closet. Root lives here.",
    themeColor: "border-emerald-900"
  }
];
