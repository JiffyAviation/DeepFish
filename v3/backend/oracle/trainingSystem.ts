/**
 * Oracle's Training System
 * Manages LLM assignments and training material distribution
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export interface LLMAssignment {
    primary: string;
    fallback_1: string;
    fallback_2: string;
    reasoning: string;
}

export interface LLMPreferences {
    system: {
        name: string;
        last_updated: string;
        updated_by: string;
    };
    bot_assignments: Record<string, LLMAssignment>;
    task_specific_overrides: Record<string, any>;
    research_notes: {
        last_leaderboard_check: string;
        findings: string[];
        next_review: string;
    };
}

/**
 * Oracle's Training Manager
 */
export class OracleTrainingSystem {
    private preferencesPath = join(process.cwd(), 'data', 'oracle', 'llm-preferences.json');
    private trainingInboxPath = join(process.cwd(), 'data', 'training', 'inbox');

    /**
     * Get LLM assignment for a bot
     */
    async getBotLLM(botId: string): Promise<LLMAssignment> {
        const prefs = await this.readPreferences();
        const assignment = prefs.bot_assignments[botId];

        if (!assignment) {
            logger.warn(`[Oracle] No LLM assignment for ${botId}, using default`);
            return {
                primary: 'gemini-2.0-flash-exp',
                fallback_1: 'gemini-1.5-pro',
                fallback_2: 'gemini-1.5-flash',
                reasoning: 'Default assignment'
            };
        }

        return assignment;
    }

    /**
     * Oracle updates LLM assignment for a bot
     */
    async updateBotLLM(
        botId: string,
        assignment: LLMAssignment
    ): Promise<void> {
        const prefs = await this.readPreferences();

        prefs.bot_assignments[botId] = assignment;
        prefs.system.last_updated = new Date().toISOString();
        prefs.system.updated_by = 'oracle';

        await this.writePreferences(prefs);

        logger.info(`[Oracle] Updated LLM for ${botId}: ${assignment.primary}`);
    }

    /**
     * Oracle adds training material to a bot's inbox
     */
    async addTrainingMaterial(
        botId: string,
        material: {
            type: 'youtube' | 'pdf' | 'url' | 'text';
            source: string;
            topic: string;
            notes?: string;
        }
    ): Promise<void> {
        const inboxDir = join(this.trainingInboxPath, botId);

        if (!existsSync(inboxDir)) {
            await mkdir(inboxDir, { recursive: true });
        }

        const filename = `${Date.now()}-${material.type}.json`;
        const filepath = join(inboxDir, filename);

        await writeFile(filepath, JSON.stringify(material, null, 2));

        logger.info(`[Oracle] Added training for ${botId}: ${material.topic}`);
    }

    /**
     * Bot checks its training inbox
     */
    async getTrainingMaterials(botId: string): Promise<any[]> {
        const inboxDir = join(this.trainingInboxPath, botId);

        if (!existsSync(inboxDir)) {
            return [];
        }

        const files = await readdir(inboxDir);
        const materials = [];

        for (const file of files) {
            const content = await readFile(join(inboxDir, file), 'utf-8');
            materials.push(JSON.parse(content));
        }

        return materials;
    }

    /**
     * Oracle conducts overnight research
     */
    async conductOvernightResearch(): Promise<void> {
        logger.info('[Oracle] Starting overnight research...');

        // TODO: Scrape LLM leaderboards
        // TODO: Analyze benchmarks
        // TODO: Update LLM assignments based on findings

        const prefs = await this.readPreferences();

        prefs.research_notes.last_leaderboard_check = new Date().toISOString();
        prefs.research_notes.findings.push(
            `Overnight research completed at ${new Date().toISOString()}`
        );

        await this.writePreferences(prefs);

        logger.info('[Oracle] Overnight research complete');
    }

    // Private helpers
    private async readPreferences(): Promise<LLMPreferences> {
        const content = await readFile(this.preferencesPath, 'utf-8');
        return JSON.parse(content);
    }

    private async writePreferences(prefs: LLMPreferences): Promise<void> {
        await writeFile(this.preferencesPath, JSON.stringify(prefs, null, 2));
    }
}

// Singleton
export const oracleTraining = new OracleTrainingSystem();
