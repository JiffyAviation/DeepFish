/**
 * Bot Loader
 * Loads bot definitions from JSON files
 */

import fs from 'fs/promises';
import path from 'path';
import { Socketable } from '../utils/socketable.js';
import { logger } from '../utils/logger.js';
import { BotDefinitionSchema, validateData } from '../utils/schemas.js';
import { AIBotRunner } from '../../bots/ai-bot-runner.js';
import { eventBus } from '../utils/eventBus.js';

export interface BotDefinition {
    id: string;
    name: string;
    title: string;
    description: string;
    personality: any;
    appearance: any;
    items: any[];
    ai: {
        model: string;
        systemPrompt: string;
        temperature: number;
        maxTokens: number;
    };
    location: {
        defaultRoom: string;
        canMove: boolean;
    };
}

export class Bot extends Socketable {
    public definition: BotDefinition;
    private currentRoom: string;
    private aiRunner: AIBotRunner;
    private conversationHistory: string[] = [];

    constructor(definition: BotDefinition) {
        super({
            id: definition.id,
            type: 'bot',
            name: definition.name,
            description: definition.description
        });

        this.definition = definition;
        this.currentRoom = definition.location.defaultRoom;
        this.aiRunner = new AIBotRunner(definition);

        // Subscribe to events
        this.subscribeToSelf('user:talk', (event) => this.handleTalk(event.data));
        this.subscribeToSelf('user:examine', (event) => this.handleExamine(event.data));

        // Listen to room chatter
        eventBus.subscribe('user:say', (event) => this.handleRoomMessage(event.data));

        logger.info(`[Bot] ${this.name} loaded`);
    }

    /**
     * Handle room message (implicit chat)
     */
    private async handleRoomMessage(data: any): Promise<void> {
        const { userId, message, roomId } = data;

        // Ignore messages not in my room
        if (roomId !== this.currentRoom) return;

        // Ignore my own messages (if bots talk to each other later)
        if (userId === this.id) return;

        logger.info(`[Bot:${this.name}] Hearing ${userId} in ${roomId}...`);

        try {
            // Get AI response with room context
            const response = await this.aiRunner.generateResponse(
                message,
                this.conversationHistory,
                roomId // Pass room context
            );

            // If AI chose to be silent, do nothing
            if (!response) return;

            // Update conversation history
            this.conversationHistory.push(`${userId}: ${message}`);
            this.conversationHistory.push(`${this.name}: ${response}`);

            // Keep history manageable
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            // Emit response
            this.emit('bot:response', {
                botId: this.id,
                userId, // Reply to the speaker
                text: response,
                emote: this.definition.personality.emotes.happy
            });

        } catch (error) {
            logger.error(`[Bot:${this.name}] Error processing room message:`, error);
        }
    }

    /**
     * Handle direct user talk (Legacy/Direct)
     */
    private async handleTalk(data: any): Promise<void> {
        const { userId, message } = data;

        logger.info(`[Bot:${this.name}] ${userId} talks directly: ${message}`);

        try {
            // Force a response for direct talk (no silence allowed)
            const response = await this.aiRunner.generateResponse(message, this.conversationHistory);

            if (response) {
                this.conversationHistory.push(`User: ${message}`);
                this.conversationHistory.push(`${this.name}: ${response}`);

                this.emit('bot:response', {
                    botId: this.id,
                    userId,
                    text: response,
                    emote: this.definition.personality.emotes.happy
                });
            } else {
                this.emit('bot:response', {
                    botId: this.id,
                    userId,
                    text: "*stares blankly*",
                    emote: 'confused'
                });
            }

        } catch (error) {
            logger.error(`[Bot:${this.name}] Error generating response:`, error);
        }
    }

    /**
     * Handle user examining this bot
     */
    private handleExamine(data: any): void {
        const { userId } = data;

        this.emit('user:output', {
            name: this.name,
            title: this.definition.title,
            description: this.definition.description,
            appearance: this.definition.appearance.description,
            items: this.definition.items.map(item => item.name)
        }, userId);
    }

    /**
     * Get bot's current room
     */
    getCurrentRoom(): string {
        return this.currentRoom;
    }

    /**
     * Move bot to new room
     */
    moveTo(roomId: string): void {
        if (!this.definition.location.canMove) {
            logger.warn(`[Bot:${this.name}] Cannot move - stationary bot`);
            return;
        }

        this.currentRoom = roomId;
        logger.info(`[Bot:${this.name}] Moved to ${roomId}`);
    }
}

export class BotLoader {
    private bots = new Map<string, Bot>();
    private botsDir = './server/world/bots';

    /**
     * Load all bots from JSON files
     */
    async loadAll(): Promise<void> {
        logger.info('[BotLoader] Loading bots...');

        try {
            const files = await fs.readdir(this.botsDir);
            const jsonFiles = files.filter(f => f.endsWith('.json'));

            for (const file of jsonFiles) {
                await this.loadBot(path.join(this.botsDir, file));
            }

            logger.info(`[BotLoader] Loaded ${this.bots.size} bots`);
        } catch (error) {
            logger.error('[BotLoader] Failed to load bots:', error);
        }
    }

    /**
     * Load single bot from file
     */
    private async loadBot(filePath: string): Promise<void> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const rawData = JSON.parse(content);

            // Validate against schema
            const definition = validateData(BotDefinitionSchema, rawData);

            const bot = new Bot(definition);
            this.bots.set(bot.id, bot);

            logger.info(`[BotLoader] ✓ Loaded ${bot.name}`);
        } catch (error) {
            logger.error(`[BotLoader] Failed to load ${filePath}:`, error);
            if (error instanceof Error) {
                logger.error(`[BotLoader] Validation error: ${error.message}`);
            }
        }
    }

    /**
     * Get bot by ID
     */
    getBot(botId: string): Bot | undefined {
        return this.bots.get(botId);
    }

    /**
     * List all bots
     */
    listBots(): Array<{ id: string; name: string; title: string; room: string }> {
        const bots: Array<{ id: string; name: string; title: string; room: string }> = [];

        for (const [id, bot] of this.bots.entries()) {
            bots.push({
                id,
                name: bot.name,
                title: bot.definition.title,
                room: bot.getCurrentRoom()
            });
        }

        return bots;
    }

    /**
     * Hot reload a bot
     */
    async reloadBot(botId: string): Promise<void> {
        logger.info(`[BotLoader] Hot-reloading ${botId}...`);

        const filePath = path.join(this.botsDir, `${botId}.json`);

        // Destroy old bot
        const oldBot = this.bots.get(botId);
        if (oldBot) {
            oldBot.destroy();
            this.bots.delete(botId);
        }

        // Load new bot
        await this.loadBot(filePath);

        logger.info(`[BotLoader] ✓ ${botId} reloaded`);
    }
}

// Global bot loader
export const botLoader = new BotLoader();
