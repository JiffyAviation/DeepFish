/**
 * Simple Orchestrator
 * Lightweight message handler that connects MessageRouter to BotLoader
 */

import { botLoader } from './world/botLoader.js';
import { logger } from './utils/logger.js';
import type { UserMessage, BotResponse } from '../types/index.js';

export class SimpleOrchestrator {
    /**
     * Handle incoming message and route to appropriate bot
     */
    async handleMessage(message: UserMessage): Promise<BotResponse> {
        const botId = message.botId || 'mei';

        logger.info(`[Orchestrator] Routing message to ${botId}`);

        try {
            // Get bot from loader
            const bot = botLoader.getBot(botId);

            if (!bot) {
                throw new Error(`Bot '${botId}' not found`);
            }

            // Generate response using bot's AI runner
            const response = bot.definition.ai ?
                await this.generateAIResponse(bot, message.text) :
                this.generateFallbackResponse(bot, message.text);

            return {
                text: response,
                botId,
                timestamp: new Date()
            };

        } catch (error: any) {
            logger.error(`[Orchestrator] Error:`, error);
            throw error;
        }
    }

    /**
     * Generate AI response using bot's configuration
     */
    private async generateAIResponse(bot: any, message: string): Promise<string> {
        // Use the bot's AI runner directly
        const aiRunner = (bot as any).aiRunner;
        if (!aiRunner) {
            return this.generateFallbackResponse(bot, message);
        }

        try {
            const response = await aiRunner.generateResponse(message, []);
            return response;
        } catch (error) {
            logger.error(`[Orchestrator] AI generation failed:`, error);
            return `I'm having trouble processing that right now. Please try again.`;
        }
    }

    /**
     * Fallback response if AI is not available
     */
    private generateFallbackResponse(bot: any, message: string): string {
        return `${bot.name}: I received your message: "${message}"`;
    }

    /**
     * Start orchestrator (load bots)
     */
    async start(): Promise<void> {
        logger.info('[Orchestrator] Starting...');
        await botLoader.loadAll();
        logger.info('[Orchestrator] Ready');
    }
}
