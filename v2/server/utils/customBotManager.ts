/**
 * Custom Bot Manager
 * Manages user-created custom bots
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';
import type { BotDefinition } from '../world/botLoader.js';

export class CustomBotManager {
    private botsDir = path.join(process.cwd(), 'data', 'users');

    /**
     * Get user's bots directory
     */
    private getUserBotsDir(userId: string): string {
        return path.join(this.botsDir, userId, 'bots');
    }

    /**
     * Get bot file path
     */
    private getBotPath(userId: string, botId: string): string {
        return path.join(this.getUserBotsDir(userId), `${botId}.json`);
    }

    /**
     * Create custom bot
     */
    async createBot(userId: string, botId: string, definition: Partial<BotDefinition>): Promise<void> {
        const botPath = this.getBotPath(userId, botId);

        // Ensure directory exists
        await fs.mkdir(path.dirname(botPath), { recursive: true });

        // Create bot definition
        const bot: BotDefinition = {
            id: botId,
            name: definition.name || botId,
            title: definition.title || 'Custom Bot',
            description: definition.description || 'A custom bot',
            personality: definition.personality || {
                traits: ['helpful', 'friendly'],
                speakingStyle: 'Casual and warm'
            },
            appearance: definition.appearance || {
                description: 'A friendly AI assistant',
                colors: ['blue', 'white'],
                avatar: `${botId}.png`,
                style: 'modern'
            },
            items: definition.items || [],
            ai: definition.ai || {
                model: 'gemini-2.0-flash-exp',
                systemPrompt: `You are ${definition.name || botId}, a helpful AI assistant.`,
                temperature: 0.7,
                maxTokens: 2048,
                apiKeySource: 'user' // Use user's API key!
            },
            location: definition.location || {
                defaultRoom: 'lobby',
                canMove: true
            },
            responsibilities: definition.responsibilities || []
        };

        // Save bot
        await fs.writeFile(botPath, JSON.stringify(bot, null, 2));

        logger.info(`[CustomBotManager] Created bot ${botId} for user ${userId}`);
    }

    /**
     * List user's bots
     */
    async listBots(userId: string): Promise<string[]> {
        try {
            const botsDir = this.getUserBotsDir(userId);
            const files = await fs.readdir(botsDir);
            return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
        } catch (error) {
            return [];
        }
    }

    /**
     * Load user's bot
     */
    async loadBot(userId: string, botId: string): Promise<BotDefinition | null> {
        try {
            const botPath = this.getBotPath(userId, botId);
            const content = await fs.readFile(botPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    /**
     * Delete user's bot
     */
    async deleteBot(userId: string, botId: string): Promise<void> {
        const botPath = this.getBotPath(userId, botId);
        await fs.unlink(botPath);
        logger.info(`[CustomBotManager] Deleted bot ${botId} for user ${userId}`);
    }

    /**
     * Update bot definition
     */
    async updateBot(userId: string, botId: string, updates: Partial<BotDefinition>): Promise<void> {
        const bot = await this.loadBot(userId, botId);

        if (!bot) {
            throw new Error(`Bot ${botId} not found`);
        }

        const updated = { ...bot, ...updates };
        const botPath = this.getBotPath(userId, botId);

        await fs.writeFile(botPath, JSON.stringify(updated, null, 2));

        logger.info(`[CustomBotManager] Updated bot ${botId} for user ${userId}`);
    }
}

// Singleton instance
export const customBotManager = new CustomBotManager();
