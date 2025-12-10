/**
 * World - The MUD/MUSH universe
 * Manages all rooms, bots, items
 */

import { Room } from './room.js';
import { botLoader } from './botLoader.js';
import { logger } from '../utils/logger.js';

export class World {
    private rooms = new Map<string, Room>();

    constructor() {
        logger.info('[World] Initializing DeepFish universe...');
        this.createDefaultRooms();
        this.loadBots();
    }

    /**
     * Load all bots
     */
    private async loadBots(): Promise<void> {
        await botLoader.loadAll();
    }

    /**
     * Create default rooms
     */
    private createDefaultRooms(): void {
        // Lobby - spawn point
        this.addRoom(new Room({
            id: 'lobby',
            name: 'The Lobby',
            description: 'A sleek, modern lobby with floor-to-ceiling windows. Digital displays show system status. Vesper stands behind the reception desk.',
            exits: ['conference', 'lunch', 'exec']
        }));

        // Conference Room
        this.addRoom(new Room({
            id: 'conference',
            name: 'Conference Room',
            description: 'A large conference room with a holographic display. Multiple bots can participate in discussions here.',
            exits: ['lobby']
        }));

        // Lunch Room
        this.addRoom(new Room({
            id: 'lunch',
            name: 'Lunch Room',
            description: 'A casual break room with comfortable seating. Perfect for informal conversations.',
            exits: ['lobby']
        }));

        // Executive Office
        this.addRoom(new Room({
            id: 'exec',
            name: 'Executive Office',
            description: 'The CEO\'s office. Quiet and private. A large desk dominates the room.',
            exits: ['lobby']
        }));

        logger.info(`[World] Created ${this.rooms.size} rooms`);
    }

    /**
     * Add room to world
     */
    addRoom(room: Room): void {
        this.rooms.set(room.id, room);
    }

    /**
     * Get room by ID
     */
    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    /**
     * List all rooms
     */
    listRooms(): Array<{ id: string; name: string; occupants: number }> {
        const rooms: Array<{ id: string; name: string; occupants: number }> = [];

        for (const [id, room] of this.rooms.entries()) {
            rooms.push({
                id,
                name: room.name,
                occupants: room.getOccupants().length
            });
        }

        return rooms;
    }
}

// Global world instance
export const world = new World();
