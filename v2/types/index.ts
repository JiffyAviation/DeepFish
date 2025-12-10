/**
 * Type Definitions for DeepFish v2
 */

export interface UserMessage {
    text: string;
    userId: string;
    botId?: string;
    image?: string;
}

export interface BotResponse {
    text: string;
    botId: string;
    timestamp: Date;
    emote?: string;
}

export interface IncomingQueueItem {
    requestId: string;
    message: UserMessage;
    timestamp: number;
}

export interface OutgoingQueueItem {
    requestId: string;
    response?: BotResponse;
    error?: string;
    timestamp: number;
}

export interface BotConfig {
    id: string;
    name: string;
    title: string;
    systemPrompt: string;
    model: string;
    color: string;
}

export interface ConferenceResponse {
    participants: Array<{
        botId: string;
        response: string;
        emote: string;
        error?: boolean;
    }>;
    atmosphere: string;
    timestamp: Date;
}
