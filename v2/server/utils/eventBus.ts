/**
 * Event Bus - Universal Socket System
 * Every component plugs into this
 */

import { EventEmitter } from 'events';

export interface DeepFishEvent {
    id: string;
    type: string;
    source: string;
    target?: string;
    data: any;
    timestamp: Date;
}

export class EventBus extends EventEmitter {
    private eventLog: DeepFishEvent[] = [];
    private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    private readonly MAX_EVENTS_PER_MINUTE = 100;
    private readonly MAX_EVENT_SIZE = 10000; // 10KB

    /**
     * Emit event with automatic logging and validation
     */
    emitEvent(event: Omit<DeepFishEvent, 'id' | 'timestamp'>): void {
        // Validate event structure
        if (!event.type || !event.source) {
            throw new Error('Invalid event: type and source are required');
        }

        // Validate event size
        const eventSize = JSON.stringify(event).length;
        if (eventSize > this.MAX_EVENT_SIZE) {
            throw new Error(`Event too large: ${eventSize} bytes (max ${this.MAX_EVENT_SIZE})`);
        }

        // Rate limiting
        if (!this.checkRateLimit(event.source)) {
            throw new Error(`Rate limit exceeded for source: ${event.source}`);
        }

        const fullEvent: DeepFishEvent = {
            ...event,
            id: this.generateId(),
            timestamp: new Date()
        };

        this.eventLog.push(fullEvent);

        // Emit to specific target if specified
        if (event.target) {
            this.emit(`${event.type}:${event.target}`, fullEvent);
        }

        // Emit to general type listeners
        this.emit(event.type, fullEvent);

        // Emit to wildcard listeners
        this.emit('*', fullEvent);

        // Keep log size manageable
        if (this.eventLog.length > 1000) {
            this.eventLog = this.eventLog.slice(-1000);
        }
    }

    /**
     * Check rate limit for event source
     */
    private checkRateLimit(source: string): boolean {
        const now = Date.now();
        const limit = this.rateLimitMap.get(source);

        if (!limit || now > limit.resetTime) {
            // Reset or create new limit
            this.rateLimitMap.set(source, {
                count: 1,
                resetTime: now + 60000 // 1 minute
            });
            return true;
        }

        if (limit.count >= this.MAX_EVENTS_PER_MINUTE) {
            return false;
        }

        limit.count++;
        return true;
    }

    /**
     * Subscribe to events
     */
    subscribe(eventType: string, handler: (event: DeepFishEvent) => void): () => void {
        this.on(eventType, handler);

        // Return unsubscribe function
        return () => {
            this.off(eventType, handler);
        };
    }

    /**
     * Get event history
     */
    getEventLog(limit: number = 100): DeepFishEvent[] {
        return this.eventLog.slice(-limit);
    }

    private generateId(): string {
        return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Global event bus - the universal socket
export const eventBus = new EventBus();
