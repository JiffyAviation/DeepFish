/**
 * Message Router
 * Uses LLM to interpret natural language and route to appropriate bots
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { botLoader } from './world/botLoader.js';
import { logger } from './utils/logger.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface RoutingResult {
    bots: string[];
    isConference: boolean;
    userMessage: string;
}

export class MessageRouter {
    private model;

    constructor() {
        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.3,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 500,
            }
        });
    }

    /**
     * Route a user message to appropriate bot(s)
     */
    async route(userInput: string): Promise<RoutingResult> {
        try {
            // Get available bots
            const availableBots = botLoader.listBots();
            const botList = availableBots.map(b => `- ${b.name} (@${b.id}): ${b.title}`).join('\n');

            const prompt = `You are a message router for a CLI chatbot system. Analyze the user's input and determine which bot(s) should respond.

Available bots:
${botList}

User input: "${userInput}"

Guidelines:
- If user explicitly mentions bot names (e.g., "Mei, Vesper, conference call"), include those bots
- If user says "everyone" or "all", include all bots
- If user asks about specific topics, route to the most appropriate bot(s):
  * Architecture, system design → oracle
  * Project management, tasks → mei
  * Finance, budget, costs → julie
  * User experience, hospitality → vesper
  * Research, experiments → gladyce
  * Creative, design → hanna
  * System admin, security → root
  * DevOps, deployment → igor
- If the intent is unclear or general conversation, route to vesper (concierge)
- Conference mode: detect if user wants multiple bots in conversation (phrases like "conference call", "discuss together", etc.)

Respond in JSON format only:
{
  "bots": ["bot-id-1", "bot-id-2"],
  "isConference": true/false,
  "reasoning": "brief explanation"
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Extract JSON from response (handle markdown code blocks)
            let jsonText = response.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(jsonText);

            // Strip @ prefix from bot IDs if present
            const cleanBots = (parsed.bots || ['vesper']).map((id: string) => id.replace(/^@/, ''));

            logger.info(`[Router] ${userInput} → ${cleanBots.join(', ')} (${parsed.reasoning})`);

            return {
                bots: cleanBots,
                isConference: parsed.isConference || false,
                userMessage: userInput
            };

        } catch (error) {
            logger.error('[Router] Error routing message:', error);
            // Fallback: route to vesper
            return {
                bots: ['vesper'],
                isConference: false,
                userMessage: userInput
            };
        }
    }
}

export const messageRouter = new MessageRouter();
