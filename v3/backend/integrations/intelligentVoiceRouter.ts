/**
 * Intelligent Voice Router
 * Routes voicemail to appropriate bot based on content
 */

import { unifiedRouter, ChannelAdapters, CommunicationChannel } from '../unifiedRouter';

export class IntelligentVoiceRouter {
    /**
     * Analyze voicemail and route to best bot
     */
    async routeVoicemail(transcription: string, caller: string, recordingUrl: string) {
        // First, ask Mei to analyze which bot should handle this
        const routingDecision = await this.decideBestBot(transcription);

        console.log(`[Voice Router] "${transcription}" → ${routingDecision.botId} (${routingDecision.reason})`);

        // Route to determined bot
        const message = ChannelAdapters.fromVoice(caller, transcription, recordingUrl);
        message.to = routingDecision.botId;

        const response = await unifiedRouter.routeMessage(message);

        // Schedule callback from THAT bot (not just Mei)
        return {
            botId: routingDecision.botId,
            response: response.content,
            voiceId: this.getBotVoiceId(routingDecision.botId)
        };
    }

    /**
     * Decide which bot should handle this
     * Uses simple keyword matching (can upgrade to LLM later)
     */
    private async decideBestBot(transcription: string): Promise<{
        botId: string;
        reason: string;
    }> {
        const lower = transcription.toLowerCase();

        // Design-related → Hanna
        if (lower.match(/design|ui|ux|mockup|interface|visual|color|layout|sketch/)) {
            return { botId: 'hanna', reason: 'Design-related question' };
        }

        // Code-related → Skillz
        if (lower.match(/code|bug|implement|develop|program|api|function/)) {
            return { botId: 'skillz', reason: 'Development question' };
        }

        // Deployment-related → Igor
        if (lower.match(/deploy|server|production|hosting|railway|docker/)) {
            return { botId: 'igor', reason: 'DevOps question' };
        }

        // Research/Training → Oracle
        if (lower.match(/research|learn|training|study|analyze/)) {
            return { botId: 'oracle', reason: 'Research question' };
        }

        // Budget/Cost → Julie
        if (lower.match(/cost|budget|price|pay|invoice|billing/)) {
            return { botId: 'julie', reason: 'Financial question' };
        }

        // Default → Mei (project coordination)
        return { botId: 'mei', reason: 'General project management' };
    }

    /**
     * Get bot's voice ID for TTS
     */
    private getBotVoiceId(botId: string): string {
        const voices: Record<string, string> = {
            'mei': 'Polly.Joanna',      // Professional female
            'hanna': 'Polly.Joanna',     // Creative female (same for now)
            'skillz': 'Polly.Matthew',   // Technical male
            'igor': 'Polly.Matthew',     // DevOps male
            'oracle': 'Polly.Brian',     // Wise male
            'julie': 'Polly.Joanna',     // Professional female
        };

        return voices[botId] || 'Polly.Joanna';
    }
}

/**
 * Two-Way Voice Conversation Handler
 * Real-time back-and-forth phone conversation
 */
export class TwoWayVoiceConversation {
    private conversationHistory: Map<string, any[]> = new Map();

    /**
     * Handle interactive voice input
     * Maintains conversation context
     */
    async handleInput(caller: string, speechInput: string, botId: string = 'mei') {
        // Get conversation history
        if (!this.conversationHistory.has(caller)) {
            this.conversationHistory.set(caller, []);
        }

        const history = this.conversationHistory.get(caller)!;

        // Add user input to history
        history.push({ role: 'user', content: speechInput });

        // Route to bot with full conversation context
        const message = ChannelAdapters.fromVoice(caller, speechInput, '');
        message.to = botId;
        message.metadata = { conversationHistory: history };

        const response = await unifiedRouter.routeMessage(message);

        // Add bot response to history
        history.push({ role: 'assistant', content: response.content });

        // Keep only last 10 exchanges (memory management)
        if (history.length > 20) {
            this.conversationHistory.set(caller, history.slice(-20));
        }

        return {
            botResponse: response.content,
            voiceId: this.getBotVoiceId(botId),
            continueConversation: true
        };
    }

    /**
     * End conversation
     */
    endConversation(caller: string) {
        this.conversationHistory.delete(caller);
    }

    private getBotVoiceId(botId: string): string {
        const voices: Record<string, string> = {
            'mei': 'Polly.Joanna',
            'hanna': 'Polly.Joanna',
            'skillz': 'Polly.Matthew',
            'igor': 'Polly.Matthew',
            'oracle': 'Polly.Brian',
            'julie': 'Polly.Joanna',
        };
        return voices[botId] || 'Polly.Joanna';
    }
}

export const intelligentVoiceRouter = new IntelligentVoiceRouter();
export const twoWayConversation = new TwoWayVoiceConversation();
