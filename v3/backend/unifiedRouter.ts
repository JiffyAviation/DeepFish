/**
 * Unified Communication Router
 * All I/O channels route through same backend
 * "All modes are the same - just different front-ends"
 */

export enum CommunicationChannel {
    CLI = 'cli',
    GUI = 'gui',
    MCP = 'mcp',
    EMAIL = 'email',
    SMS = 'sms',
    VOICE = 'voice'
}

export interface Message {
    channel: CommunicationChannel;
    from: string; // User identifier (email, phone, userId, etc.)
    to?: string; // Target bot ID (defaults to Mei)
    content: string;
    metadata?: {
        subject?: string; // For email
        recordingUrl?: string; // For voice
        conversationId?: string; // For threading
        attachments?: any[];
    };
}

export interface Response {
    channel: CommunicationChannel;
    to: string; // Recipient
    content: string;
    metadata?: {
        assetIds?: string[]; // Asset Bus tokens
        transfers?: any[]; // Bot transfers
        voiceUrl?: string; // For voice TTS
    };
}

/**
 * Unified Communication Router
 * Single entry point for ALL communication channels
 */
export class UnifiedRouter {
    /**
     * Route message from any channel to bot backend
     */
    async routeMessage(message: Message): Promise<Response> {
        console.log(`[Router] ${message.channel}: ${message.from} → ${message.to || 'mei'}`);

        // 1. Determine target bot (default: Mei)
        const botId = message.to || 'mei';

        // 2. Add channel context to message
        const enhancedMessage = this.addChannelContext(message);

        // 3. Call bot (unified backend)
        const botResponse = await this.callBot(botId, enhancedMessage);

        // 4. Format response for channel
        const formattedResponse = this.formatForChannel(
            botResponse,
            message.channel,
            message.from
        );

        return formattedResponse;
    }

    /**
     * Add channel-specific context
     */
    private addChannelContext(message: Message): string {
        let context = `[Channel: ${message.channel}]\n`;

        // Channel-specific constraints
        switch (message.channel) {
            case CommunicationChannel.SMS:
                context += '[Constraint: Keep response under 160 characters]\n';
                break;
            case CommunicationChannel.VOICE:
                context += '[Constraint: Natural speech, 30 seconds max]\n';
                break;
            case CommunicationChannel.EMAIL:
                context += '[Format: Professional email with greeting/closing]\n';
                break;
        }

        context += `\nUser message:\n${message.content}`;

        return context;
    }

    /**
     * Call bot backend (unified)
     */
    private async callBot(botId: string, message: string): Promise<string> {
        // TODO: Integrate with EnhancedBotLoader
        // This is where ALL channels converge to same backend
        console.log(`[Router] Calling ${botId} with message`);
        return `Response from ${botId}: Processing your request...`;
    }

    /**
     * Format response for specific channel
     */
    private formatForChannel(
        response: string,
        channel: CommunicationChannel,
        recipient: string
    ): Response {
        let formattedContent = response;
        const metadata: Response['metadata'] = {};

        switch (channel) {
            case CommunicationChannel.SMS:
                // Truncate to 160 chars
                formattedContent = response.length > 160
                    ? response.substring(0, 157) + '...'
                    : response;
                break;

            case CommunicationChannel.EMAIL:
                // Add email formatting
                formattedContent = `Hi,\n\n${response}\n\nBest regards,\nMei\nDeepFish AI Studio`;
                break;

            case CommunicationChannel.VOICE:
                // Natural speech formatting
                formattedContent = response.replace(/\n/g, '. ');
                // TODO: Generate TTS audio URL
                metadata.voiceUrl = '/path/to/tts.mp3';
                break;
        }

        return {
            channel,
            to: recipient,
            content: formattedContent,
            metadata
        };
    }
}

/**
 * Channel adapters - convert channel-specific input to unified Message
 */
export class ChannelAdapters {
    /**
     * CLI input → Message
     */
    static fromCLI(userInput: string, userId: string): Message {
        return {
            channel: CommunicationChannel.CLI,
            from: userId,
            content: userInput
        };
    }

    /**
     * Email → Message
     */
    static fromEmail(from: string, subject: string, body: string): Message {
        return {
            channel: CommunicationChannel.EMAIL,
            from,
            content: body,
            metadata: { subject }
        };
    }

    /**
     * SMS → Message
     */
    static fromSMS(from: string, body: string): Message {
        return {
            channel: CommunicationChannel.SMS,
            from,
            content: body
        };
    }

    /**
     * Voice → Message
     */
    static fromVoice(from: string, transcription: string, recordingUrl: string): Message {
        return {
            channel: CommunicationChannel.VOICE,
            from,
            content: transcription,
            metadata: { recordingUrl }
        };
    }

    /**
     * GUI → Message
     */
    static fromGUI(userId: string, message: string, botId?: string): Message {
        return {
            channel: CommunicationChannel.GUI,
            from: userId,
            to: botId,
            content: message
        };
    }

    /**
     * MCP → Message
     */
    static fromMCP(userId: string, message: string, botId?: string): Message {
        return {
            channel: CommunicationChannel.MCP,
            from: userId,
            to: botId,
            content: message
        };
    }
}

// Singleton
export const unifiedRouter = new UnifiedRouter();
