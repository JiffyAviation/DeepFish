/**
 * Agent Loader Utility
 * Dynamically loads agent data from /agents folder
 */

import { AgentProfile, AgentId } from '../types';

// Import all agent profiles
import oracleProfile from '../agents/oracle/profile.json';

// Import base prompts as raw text
import oraclePrompt from '../agents/oracle/base-prompt.txt?raw';

/**
 * Load agent data from folder structure
 */
export const loadAgent = async (agentId: string): Promise<AgentProfile> => {
    const profile = await import(`../agents/${agentId}/profile.json`);
    const basePrompt = await import(`../agents/${agentId}/base-prompt.txt?raw`);

    return {
        ...profile.default,
        basePrompt: basePrompt.default
    };
};

/**
 * Pre-loaded agents for immediate use
 * (Avoids async loading on initial render)
 */
export const AGENTS: Record<AgentId, AgentProfile> = {
    [AgentId.ORACLE]: {
        ...oracleProfile,
        basePrompt: oraclePrompt
    },
    // TODO: Add other agents as we create their folders
    [AgentId.MEI]: {
        id: AgentId.MEI,
        name: 'Mei',
        title: 'Studio Director',
        description: 'Executive assistant and team coordinator',
        icon: 'Sparkles',
        color: 'text-blue-400',
        isCore: true,
        basePrompt: '' // Will be loaded from agents/mei/ folder
    },
    [AgentId.VESPER]: {
        id: AgentId.VESPER,
        name: 'Vesper',
        title: 'Global Concierge',
        description: 'Travel, lifestyle, and investor relations',
        icon: 'Plane',
        color: 'text-amber-400',
        isCore: true,
        basePrompt: ''
    },
    // ... (rest will be migrated)
} as any; // Temporary type assertion

/**
 * Get agent's viseme image path
 */
export const getVisemePath = (agentId: string, viseme: string): string => {
    return `/agents/${agentId}/visemes/${viseme}.png`;
};

/**
 * Load agent memories
 */
export const loadMemories = async (agentId: string) => {
    try {
        const memories = await import(`../agents/${agentId}/memories.json`);
        return memories.default;
    } catch {
        return { facts: [], preferences: {}, conversationHistory: [] };
    }
};

/**
 * Save agent memories (will need backend)
 */
export const saveMemories = async (agentId: string, memories: any) => {
    // TODO: Implement with backend API
    console.log(`[AgentLoader] Saving memories for ${agentId}`, memories);
};
