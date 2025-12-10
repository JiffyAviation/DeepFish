/**
 * Constitution System - Global + Agent Constitutions
 * Reads Global Constitution + Bot's embedded Agent Constitution
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export interface GlobalConstitution {
    constitution: {
        name: string;
        version: string;
        description: string;
        lastUpdated: string;
    };
    universal_capabilities: Record<string, any>;
    universal_rules: Record<string, any>;
    communication_protocols: Record<string, any>;
    data_handling: Record<string, any>;
}

export interface AgentConstitution {
    version: string;
    personal_rules: Record<string, any>;
    speaking_guidelines?: Record<string, any>;
}

export interface BotConstitutionSystem {
    globalConstitution: GlobalConstitution | null;
    agentConstitution: AgentConstitution | null;
    followConstitution: boolean;
    lastRead: number;
    refreshInterval?: NodeJS.Timeout;
}

const constitutionSystems = new Map<string, BotConstitutionSystem>();

/**
 * Initialize constitution system for a bot
 */
export async function initBotConstitution(botId: string, followConstitution: boolean = true): Promise<void> {
    const system: BotConstitutionSystem = {
        globalConstitution: null,
        agentConstitution: null,
        followConstitution,
        lastRead: 0
    };

    // Read both constitutions
    await refreshConstitutions(botId, system);

    // Start 5-minute refresh cycle
    if (followConstitution) {
        system.refreshInterval = setInterval(async () => {
            await refreshConstitutions(botId, system);
            logger.info(`[${botId}] Constitutions refreshed`);
        }, 5 * 60 * 1000); // 5 minutes
    }

    constitutionSystems.set(botId, system);

    logger.info(`[${botId}] Constitution system initialized (following: ${followConstitution})`);
}

/**
 * Refresh both Global and Agent constitutions
 */
async function refreshConstitutions(botId: string, system: BotConstitutionSystem): Promise<void> {
    try {
        // Read Global Constitution
        const globalPath = join(process.cwd(), 'server', 'world', 'global-constitution.json');
        const globalContent = await readFile(globalPath, 'utf-8');
        system.globalConstitution = JSON.parse(globalContent);

        // Read bot's JSON file to get embedded Agent Constitution
        const botPath = join(process.cwd(), 'server', 'world', 'bots', `${botId}.json`);
        const botContent = await readFile(botPath, 'utf-8');
        const botData = JSON.parse(botContent);

        // Extract agent_constitution from bot JSON
        system.agentConstitution = botData.agent_constitution || null;

        system.lastRead = Date.now();
    } catch (error) {
        logger.error(`[${botId}] Error reading constitutions:`, error);
    }
}

/**
 * Get constitutions as text for bot system prompt
 */
export async function getConstitutionsText(botId: string): Promise<string> {
    const system = constitutionSystems.get(botId);

    if (!system || !system.followConstitution) {
        return ''; // Constitution following disabled
    }

    let text = '\n\n=== GLOBAL CONSTITUTION ===\n';
    text += formatGlobalConstitution(system.globalConstitution);

    if (system.agentConstitution) {
        text += '\n\n=== YOUR AGENT CONSTITUTION ===\n';
        text += formatAgentConstitution(system.agentConstitution);
    }

    text += '\n=== END CONSTITUTIONS ===\n\n';

    return text;
}

function formatGlobalConstitution(constitution: GlobalConstitution | null): string {
    if (!constitution) return '';

    let text = '';

    if (constitution.universal_capabilities) {
        text += 'UNIVERSAL CAPABILITIES:\n';
        for (const [key, cap] of Object.entries(constitution.universal_capabilities)) {
            text += `- ${cap.capability}: ${cap.instructions}\n`;
        }
    }

    if (constitution.universal_rules) {
        text += '\nUNIVERSAL RULES:\n';
        for (const [key, rule] of Object.entries(constitution.universal_rules)) {
            text += `- ${rule.rule}: ${rule.description}\n`;
        }
    }

    return text;
}

function formatAgentConstitution(constitution: AgentConstitution | null): string {
    if (!constitution) return '';

    let text = '';

    if (constitution.personal_rules) {
        text += 'YOUR PERSONAL RULES:\n';
        for (const [key, rule] of Object.entries(constitution.personal_rules)) {
            text += `- ${rule.rule}: ${rule.description}\n`;
        }
    }

    if (constitution.speaking_guidelines) {
        text += '\nSPEAKING GUIDELINES:\n';
        if (constitution.speaking_guidelines.phrases_to_use) {
            text += 'Use: ' + constitution.speaking_guidelines.phrases_to_use.join(', ') + '\n';
        }
        if (constitution.speaking_guidelines.phrases_to_avoid) {
            text += 'Avoid: ' + constitution.speaking_guidelines.phrases_to_avoid.join(', ') + '\n';
        }
    }

    return text;
}

/**
 * Toggle constitution following for a bot
 */
export function toggleConstitution(botId: string, follow: boolean): void {
    const system = constitutionSystems.get(botId);
    if (!system) return;

    system.followConstitution = follow;

    if (follow && !system.refreshInterval) {
        // Start refresh cycle
        system.refreshInterval = setInterval(async () => {
            await refreshConstitutions(botId, system);
            logger.info(`[${botId}] Constitutions refreshed`);
        }, 5 * 60 * 1000);
    } else if (!follow && system.refreshInterval) {
        // Stop refresh cycle
        clearInterval(system.refreshInterval);
        system.refreshInterval = undefined;
    }

    logger.info(`[${botId}] Constitution following ${follow ? 'enabled' : 'disabled'}`);
}

/**
 * Get constitution status for a bot
 */
export function getConstitutionStatus(botId: string): {
    following: boolean;
    lastRead: Date | null;
    minutesSinceRead: number;
} {
    const system = constitutionSystems.get(botId);

    if (!system) {
        return { following: false, lastRead: null, minutesSinceRead: 0 };
    }

    const minutesSinceRead = system.lastRead
        ? Math.floor((Date.now() - system.lastRead) / 60000)
        : 0;

    return {
        following: system.followConstitution,
        lastRead: system.lastRead ? new Date(system.lastRead) : null,
        minutesSinceRead
    };
}
