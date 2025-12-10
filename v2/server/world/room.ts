/**
 * Room - MUD/MUSH style location
 * Socketable component that can be wired to CLI or React
 */

import { Socketable } from '../utils/socketable.js';
import { logger } from '../utils/logger.js';

export interface RoomConfig {
    id: string;
    name: string;
    description: string;
    exits?: string[]; // IDs of connected rooms
}

export class Room extends Socketable {
    private occupants = new Set<string>(); // User/bot IDs
    private exits: string[];

    constructor(config: RoomConfig) {
        super({
            id: config.id,
            type: 'room',
            name: config.name,
            description: config.description
        });

        this.exits = config.exits || [];

        // Subscribe to room events
        this.subscribeToSelf('user:enter', (event) => this.handleEnter(event.data.userId));
        this.subscribeToSelf('user:leave', (event) => this.handleLeave(event.data.userId));
        this.subscribeToSelf('user:say', (event) => this.handleSay(event.data.userId, event.data.message));
        this.subscribeToSelf('user:look', (event) => this.handleLook(event.data.userId));

        logger.info(`[Room] ${this.name} initialized`);
    }

    /**
     * User enters room
     */
    private handleEnter(userId: string): void {
        this.occupants.add(userId);
        logger.info(`[Room:${this.name}] ${userId} entered`);

        // Broadcast to room
        this.emit('room:announce', {
            roomId: this.id,
            message: `${userId} has entered.`
        });
    }

    /**
     * User leaves room
     */
    private handleLeave(userId: string): void {
        this.occupants.delete(userId);
        logger.info(`[Room:${this.name}] ${userId} left`);

        // Broadcast to room
        this.emit('room:announce', {
            roomId: this.id,
            message: `${userId} has left.`
        });
    }

    /**
     * User says something
     */
    private handleSay(userId: string, message: string): void {
        logger.info(`[Room:${this.name}] ${userId}: ${message}`);

        // Broadcast to all occupants
        this.emit('room:message', {
            roomId: this.id,
            userId,
            message
        });
    }

    /**
     * User looks around
     */
    private handleLook(userId: string): void {
        const description = this.getDescription();

        // Send description to user
        this.emit('user:output', description, userId);
    }

    /**
     * Get room description (MUD-style)
     */
    private getDescription(): any {
        return {
            name: this.name,
            description: this.description,
            occupants: Array.from(this.occupants),
            exits: this.exits
        };
    }

    /**
     * Get current occupants
     */
    getOccupants(): string[] {
        return Array.from(this.occupants);
    }
}
