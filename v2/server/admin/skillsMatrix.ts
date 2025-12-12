/**
 * Admin Dashboard - Skills Matrix Manager
 * Allows admin to enable/disable skills per bot
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger.js';

interface BotSkills {
    [skillId: string]: 0 | 1;
}

interface BotJSON {
    id: string;
    name: string;
    library_access: {
        description: string;
        skills: BotSkills;
    };
}

export class SkillsMatrixManager {
    private botsDir = join(process.cwd(), 'server', 'world', 'bots');

    /**
     * Get all bots with their skill access
     */
    async getAllBotSkills(): Promise<Record<string, BotSkills>> {
        const bots = ['oracle', 'mei', 'julie'];
        const matrix: Record<string, BotSkills> = {};

        for (const botId of bots) {
            const botData = await this.readBot(botId);
            matrix[botId] = botData.library_access.skills;
        }

        return matrix;
    }

    /**
     * Enable a skill for a bot
     */
    async enableSkill(botId: string, skillId: string): Promise<void> {
        const botData = await this.readBot(botId);

        if (!(skillId in botData.library_access.skills)) {
            throw new Error(`Skill ${skillId} not found in bot ${botId}`);
        }

        botData.library_access.skills[skillId] = 1;
        await this.writeBot(botId, botData);

        logger.info(`[Admin] Enabled skill ${skillId} for ${botId}`);
    }

    /**
     * Disable a skill for a bot
     */
    async disableSkill(botId: string, skillId: string): Promise<void> {
        const botData = await this.readBot(botId);

        if (!(skillId in botData.library_access.skills)) {
            throw new Error(`Skill ${skillId} not found in bot ${botId}`);
        }

        botData.library_access.skills[skillId] = 0;
        await this.writeBot(botId, botData);

        logger.info(`[Admin] Disabled skill ${skillId} for ${botId}`);
    }

    /**
     * Get skill status for a specific bot
     */
    async getBotSkills(botId: string): Promise<BotSkills> {
        const botData = await this.readBot(botId);
        return botData.library_access.skills;
    }

    /**
     * Bulk update skills for a bot
     */
    async updateBotSkills(botId: string, skills: BotSkills): Promise<void> {
        const botData = await this.readBot(botId);
        botData.library_access.skills = skills;
        await this.writeBot(botId, botData);

        logger.info(`[Admin] Bulk updated skills for ${botId}`);
    }

    // Private helpers
    private async readBot(botId: string): Promise<BotJSON> {
        const path = join(this.botsDir, `${botId}.json`);
        const content = await readFile(path, 'utf-8');
        return JSON.parse(content);
    }

    private async writeBot(botId: string, data: BotJSON): Promise<void> {
        const path = join(this.botsDir, `${botId}.json`);
        await writeFile(path, JSON.stringify(data, null, 4));
    }
}

// Singleton
export const skillsMatrix = new SkillsMatrixManager();
