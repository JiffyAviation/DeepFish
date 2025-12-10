/**
 * Message Persistence
 * Saves queued messages to disk to survive crashes
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

interface PersistedMessage {
    requestId: string;
    message: any;
    timestamp: number;
}

export class MessagePersistence {
    private persistPath: string;
    private saveInterval: NodeJS.Timeout | null = null;
    private pendingMessages = new Map<string, PersistedMessage>();
    private isDirty = false;

    constructor(persistDir: string = './data') {
        this.persistPath = path.join(persistDir, 'messages.json');
        this.ensureDirectory();
        this.startAutoSave();
    }

    /**
     * Ensure data directory exists
     */
    private async ensureDirectory(): Promise<void> {
        try {
            await fs.mkdir(path.dirname(this.persistPath), { recursive: true });
        } catch (error) {
            logger.error('[Persistence] Failed to create directory:', error);
        }
    }

    /**
     * Save a message
     */
    async save(requestId: string, message: any): Promise<void> {
        this.pendingMessages.set(requestId, {
            requestId,
            message,
            timestamp: Date.now()
        });
        this.isDirty = true;
    }

    /**
     * Remove a message (processed successfully)
     */
    async remove(requestId: string): Promise<void> {
        this.pendingMessages.delete(requestId);
        this.isDirty = true;
    }

    /**
     * Load persisted messages on startup
     */
    async load(): Promise<PersistedMessage[]> {
        try {
            const data = await fs.readFile(this.persistPath, 'utf-8');
            const messages = JSON.parse(data);
            logger.info(`[Persistence] Loaded ${messages.length} persisted messages`);
            return messages;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                logger.info('[Persistence] No persisted messages found');
                return [];
            }
            logger.error('[Persistence] Failed to load messages:', error);
            return [];
        }
    }

    /**
     * Write to disk
     */
    private async writeToDisk(): Promise<void> {
        if (!this.isDirty) return;

        try {
            const messages = Array.from(this.pendingMessages.values());
            await fs.writeFile(this.persistPath, JSON.stringify(messages, null, 2));
            this.isDirty = false;
            logger.debug(`[Persistence] Saved ${messages.length} messages to disk`);
        } catch (error) {
            logger.error('[Persistence] Failed to write to disk:', error);
        }
    }

    /**
     * Auto-save every 5 seconds
     */
    private startAutoSave(): void {
        this.saveInterval = setInterval(() => {
            this.writeToDisk();
        }, 5000);
    }

    /**
     * Graceful shutdown - save immediately
     */
    async shutdown(): Promise<void> {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        await this.writeToDisk();
        logger.info('[Persistence] Shutdown complete');
    }
}
