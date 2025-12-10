/**
 * Message Buffer Utilities
 * v3.0.0 - Prevents memory leaks from unbounded message arrays
 */

import { Message } from '../types';

const MAX_MESSAGES_PER_ROOM = 1000;

/**
 * Bounded message buffer that automatically removes oldest messages
 * when limit is reached (circular buffer pattern)
 */
export class MessageBuffer {
    private messages: Message[];
    private maxSize: number;

    constructor(maxSize: number = MAX_MESSAGES_PER_ROOM) {
        this.messages = [];
        this.maxSize = maxSize;
    }

    /**
     * Add a message to the buffer
     * Automatically removes oldest message if buffer is full
     */
    add(message: Message): void {
        this.messages.push(message);
        if (this.messages.length > this.maxSize) {
            this.messages.shift(); // Remove oldest
        }
    }

    /**
     * Get all messages (returns a copy to prevent external mutation)
     */
    getAll(): Message[] {
        return [...this.messages];
    }

    /**
     * Clear all messages
     */
    clear(): void {
        this.messages = [];
    }

    /**
     * Get current message count
     */
    size(): number {
        return this.messages.length;
    }
}

/**
 * Helper to create message buffers for multiple rooms
 */
export const createMessageBuffers = (roomIds: string[]): Record<string, MessageBuffer> => {
    return Object.fromEntries(
        roomIds.map(id => [id, new MessageBuffer()])
    );
};

/**
 * Helper to add message to array with automatic limiting
 * Use this for simple cases where you don't need the full MessageBuffer class
 */
export const addMessageWithLimit = (
    messages: Message[],
    newMessage: Message,
    limit: number = MAX_MESSAGES_PER_ROOM
): Message[] => {
    return [...messages, newMessage].slice(-limit);
};
