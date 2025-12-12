/**
 * AI Bot Runner
 * Handles AI integration for bot responses
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../server/config.js';
import { logger } from '../server/utils/logger.js';
import type { BotDefinition } from '../server/world/botLoader.js';

export class AIBotRunner {
    private genAI: GoogleGenerativeAI;
    private botDefinition: BotDefinition;

    constructor(botDefinition: BotDefinition) {
        this.botDefinition = botDefinition;
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY!);
    }

    /**
     * Generate AI response
     */
    async generateResponse(userMessage: string, conversationHistory: string[] = [], roomContext: string = ''): Promise<string | null> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: this.botDefinition.ai.model
            });

            // Build prompt with bot personality
            const systemPrompt = this.botDefinition.ai.systemPrompt;
            const fullPrompt = this.buildPrompt(systemPrompt, conversationHistory, userMessage, roomContext);

            logger.info(`[AIBot:${this.botDefinition.name}] Generating response...`);

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: this.botDefinition.ai.temperature,
                    maxOutputTokens: this.botDefinition.ai.maxTokens
                }
            });

            const response = result.response;
            let text = response.text().trim();

            // Handle silence
            if (text.includes('[SILENCE]') || text === '') {
                logger.info(`[AIBot:${this.botDefinition.name}] Chose silence`);
                return null;
            }

            logger.info(`[AIBot:${this.botDefinition.name}] Response generated`);

            return text;

        } catch (error) {
            logger.error(`[AIBot:${this.botDefinition.name}] Error generating response:`, error);

            // On error, be silent rather than spamming error messages
            return null;
        }
    }

    /**
     * Build prompt with conversation history
     */
    private buildPrompt(systemPrompt: string, history: string[], userMessage: string, roomContext: string): string {
        let prompt = systemPrompt + '\n\n';

        // Add current date/time so bot knows the time
        const now = new Date();
        const currentDateTime = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        prompt += `CONTEXT:\n`;
        prompt += `Current Date & Time: ${currentDateTime}\n`;
        prompt += `If the message is addressed to you, or if you have something valuable to add based on your personality, please respond.\n`;
        prompt += `If the message does not concern you and you have nothing to add, output exactly: [SILENCE]\n\n`;

        if (history.length > 0) {
            prompt += 'Conversation history:\n';
            prompt += history.join('\n') + '\n\n';
        }

        prompt += `User: ${userMessage}\n`;
        prompt += `${this.botDefinition.name}:`;

        return prompt;
    }

    /**
     * Get bot info
     */
    getBotInfo() {
        return {
            id: this.botDefinition.id,
            name: this.botDefinition.name,
            title: this.botDefinition.title
        };
    }
}
