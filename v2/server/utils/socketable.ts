/**
 * Socketable Component Base Class
 * Every room, bot, item inherits from this
 */

import { eventBus, DeepFishEvent } from './eventBus.js';

export interface SocketableConfig {
    id: string;
    type: 'room' | 'bot' | 'item' | 'system';
    name: string;
    description?: string;
}

export class Socketable {
    public readonly id: string;
    public readonly type: string;
    public readonly name: string;
    public description: string;

    private subscriptions: Array<() => void> = [];

    constructor(config: SocketableConfig) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.name;
        this.description = config.description || '';
    }

    /**
     * Emit event from this component
     */
    protected emit(eventType: string, data: any, target?: string): void {
        eventBus.emitEvent({
            type: eventType,
            source: this.id,
            target,
            data
        });
    }

    /**
     * Subscribe to events
     */
    protected subscribe(eventType: string, handler: (event: DeepFishEvent) => void): void {
        const unsubscribe = eventBus.subscribe(eventType, handler);
        this.subscriptions.push(unsubscribe);
    }

    /**
     * Subscribe to events targeted at this component
     */
    protected subscribeToSelf(eventType: string, handler: (event: DeepFishEvent) => void): void {
        const unsubscribe = eventBus.subscribe(`${eventType}:${this.id}`, handler);
        this.subscriptions.push(unsubscribe);
    }

    /**
     * Cleanup subscriptions
     */
    destroy(): void {
        for (const unsubscribe of this.subscriptions) {
            unsubscribe();
        }
        this.subscriptions = [];
    }

    /**
     * Get component info (for 'look' command)
     */
    inspect(): any {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            description: this.description
        };
    }
}
