
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
// This static AGENTS export is maintained for backward compatibility with Sidebar.tsx

export const AGENTS: Record<AgentId, { id: AgentId; name: string; title: string; description: string; icon: string; color: string; isCore?: boolean; basePrompt: string }> = {
  [AgentId.ORACLE]: {
    id: AgentId.ORACLE,
    name: 'Oracle',
    title: 'The Architect',
    description: 'System overseer',
    icon: 'Eye',
    color: 'text-zinc-100',
    isCore: true,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.MEI]: {
    id: AgentId.MEI,
    name: 'Mei',
    title: 'Studio Director',
    description: 'Executive assistant and team coordinator',
    icon: 'Sparkles',
    color: 'text-blue-400',
    isCore: true,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.VESPER]: {
    id: AgentId.VESPER,
    name: 'Vesper',
    title: 'Global Concierge',
    description: 'Travel, lifestyle, and investor relations',
    icon: 'Plane',
    color: 'text-amber-400',
    isCore: true,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.HR]: {
    id: AgentId.HR,
    name: 'HR',
    title: 'Human Resources',
    description: 'Agent configuration and management',
    icon: 'Users',
    color: 'text-rose-400',
    isCore: true,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.ABACUS]: {
    id: AgentId.ABACUS,
    name: 'Abacus',
    title: 'Strategic Owner',
    description: 'Boardroom moderator',
    icon: 'Building',
    color: 'text-yellow-400',
    isCore: true,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.ROOT]: {
    id: AgentId.ROOT,
    name: 'Root',
    title: 'System Core',
    description: 'Infrastructure and automation',
    icon: 'Terminal',
    color: 'text-green-400',
    isCore: true,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.IT]: {
    id: AgentId.IT,
    name: 'IT',
    title: 'Principal Architect',
    description: 'Backend and infrastructure',
    icon: 'Code',
    color: 'text-gray-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.CREATIVE]: {
    id: AgentId.CREATIVE,
    name: 'Hanna',
    title: 'Senior Art Director',
    description: 'UI/UX and visual design',
    icon: 'Palette',
    color: 'text-pink-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.SOCIAL]: {
    id: AgentId.SOCIAL,
    name: 'Sally',
    title: 'Marketing Director',
    description: 'Launches and growth',
    icon: 'Megaphone',
    color: 'text-purple-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.SKILLZ]: {
    id: AgentId.SKILLZ,
    name: 'Skillz',
    title: 'DevOps Engineer',
    description: 'Deployment and automation',
    icon: 'Wrench',
    color: 'text-orange-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.QC]: {
    id: AgentId.QC,
    name: 'QC',
    title: 'Quality Control',
    description: 'Testing and validation',
    icon: 'CheckCircle',
    color: 'text-teal-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.LUNCHROOM]: {
    id: AgentId.LUNCHROOM,
    name: 'Lunchroom',
    title: 'Break Room',
    description: 'Casual space',
    icon: 'Coffee',
    color: 'text-emerald-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.MCP]: {
    id: AgentId.MCP,
    name: 'MCP',
    title: 'Master Control',
    description: 'System coordination',
    icon: 'Cpu',
    color: 'text-indigo-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.SLASH]: {
    id: AgentId.SLASH,
    name: 'Slash',
    title: 'Command Interface',
    description: 'CLI expert',
    icon: 'Zap',
    color: 'text-cyan-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.SKIPPY]: {
    id: AgentId.SKIPPY,
    name: 'Skippy',
    title: 'Technical Writer',
    description: 'Documentation',
    icon: 'FileText',
    color: 'text-blue-300',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.SUBS]: {
    id: AgentId.SUBS,
    name: 'Subs',
    title: 'Subscription Manager',
    description: 'Billing and subscriptions',
    icon: 'CreditCard',
    color: 'text-lime-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.SHIPPING]: {
    id: AgentId.SHIPPING,
    name: 'Shipping',
    title: 'Release Manager',
    description: 'Product delivery',
    icon: 'Package',
    color: 'text-sky-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.CALL_CENTER]: {
    id: AgentId.CALL_CENTER,
    name: 'Call Center',
    title: 'Support',
    description: 'Customer support',
    icon: 'Phone',
    color: 'text-violet-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  },
  [AgentId.IGOR]: {
    id: AgentId.IGOR,
    name: 'Igor',
    title: 'Research Assistant',
    description: 'Research and analysis',
    icon: 'Flask',
    color: 'text-red-400',
    isCore: false,
    basePrompt: COMMON_CONTEXT
  }
};

// Alias for backward compatibility with App.tsx
export const INITIAL_AGENTS = AGENTS;



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
