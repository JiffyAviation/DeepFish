/**
 * Request Deduplicator
 * Prevents duplicate message processing
 */

import { logger } from './logger.js';

interface CachedResponse {
    response: any;
    timestamp: number;
}

export class RequestDeduplicator {
    private cache = new Map<string, CachedResponse>();
    private readonly cacheTTL = 60000; // 1 minute

    constructor() {
        // Cleanup expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Generate hash from message
     */
    private hash(userId: string, text: string): string {
        return `${userId}:${text.substring(0, 100)}`;
    }

    /**
     * Check if request is duplicate
     */
    isDuplicate(userId: string, text: string): boolean {
        const key = this.hash(userId, text);
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            logger.info('[Dedup] Duplicate request detected');
            return true;
        }

        return false;
    }

    /**
     * Get cached response
     */
    getCached(userId: string, text: string): any | null {
        const key = this.hash(userId, text);
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.response;
        }

        return null;
    }

    /**
     * Cache response
     */
    cacheResponse(userId: string, text: string, response: any): void {
        const key = this.hash(userId, text);
        this.cache.set(key, {
            response,
            timestamp: Date.now()
        });
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > this.cacheTTL) {
                this.cache.delete(key);
            }
        }
    }
}
