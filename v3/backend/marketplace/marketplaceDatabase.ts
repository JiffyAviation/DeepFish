/**
 * Marketplace Database Schema
 * Store purchases, user inventory, and marketplace data
 */

export interface UserInventory {
    userId: string;
    ownedAgents: OwnedAgent[];
    gachaPulls: GachaPullHistory[];
    totalSpent: number;
}

export interface OwnedAgent {
    agentId: string;
    license: 'personal' | 'commercial' | 'enterprise';
    purchaseDate: string;
    price: number;
    source: 'purchase' | 'gacha' | 'gift';
}

export interface GachaPullHistory {
    date: string;
    type: 'single' | 'ten-pull';
    cost: number;
    results: string[]; // agentIds
}

/**
 * Simple in-memory marketplace database
 * TODO: Replace with real database (Supabase, Firebase, etc.)
 */
export class MarketplaceDatabase {
    private userInventories: Map<string, UserInventory> = new Map();

    getUserInventory(userId: string): UserInventory {
        if (!this.userInventories.has(userId)) {
            this.userInventories.set(userId, {
                userId,
                ownedAgents: [],
                gachaPulls: [],
                totalSpent: 0
            });
        }
        return this.userInventories.get(userId)!;
    }

    addOwnedAgent(userId: string, agent: OwnedAgent): void {
        const inventory = this.getUserInventory(userId);
        inventory.ownedAgents.push(agent);
        inventory.totalSpent += agent.price;
    }

    recordGachaPull(userId: string, pull: GachaPullHistory): void {
        const inventory = this.getUserInventory(userId);
        inventory.gachaPulls.push(pull);
        inventory.totalSpent += pull.cost;
    }

    userOwnsAgent(userId: string, agentId: string): boolean {
        const inventory = this.getUserInventory(userId);
        return inventory.ownedAgents.some(a => a.agentId === agentId);
    }
}

export const marketplaceDb = new MarketplaceDatabase();
