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
    async generateResponse(userMessage: string, conversationHistory: string[] = []): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: this.botDefinition.ai.model
            });

            // Build prompt with bot personality
            const systemPrompt = this.botDefinition.ai.systemPrompt;
            const fullPrompt = this.buildPrompt(systemPrompt, conversationHistory, userMessage);

            logger.info(`[AIBot:${this.botDefinition.name}] Generating response...`);

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: this.botDefinition.ai.temperature,
                    maxOutputTokens: this.botDefinition.ai.maxTokens
                }
            });

            const response = result.response;
            const text = response.text();

            logger.info(`[AIBot:${this.botDefinition.name}] Response generated`);

            return text;

        } catch (error) {
            logger.error(`[AIBot:${this.botDefinition.name}] Error generating response:`, error);

            // Fallback response
            return `${this.botDefinition.name}: I'm having trouble thinking right now. Can you try again?`;
        }
    }

    /**
     * Build prompt with conversation history
     */
    private buildPrompt(systemPrompt: string, history: string[], userMessage: string): string {
        let prompt = systemPrompt + '\n\n';

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
