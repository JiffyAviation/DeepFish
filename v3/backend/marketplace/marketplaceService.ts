/**
 * DeepFish Agent Marketplace
 * Gacha-style agent store with FOMO mechanics
 */

export enum AgentRarity {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
    MYTHIC = 'mythic'
}

export enum AgentLicense {
    PERSONAL = 'personal',
    COMMERCIAL = 'commercial',
    ENTERPRISE = 'enterprise'
}

export interface MarketplaceAgent {
    id: string;
    name: string;
    fshFile: string; // Path to .fsh
    rarity: AgentRarity;
    price: {
        personal: number;
        commercial: number;
        enterprise: number;
    };
    downloads: number;
    rating: number;
    reviews: AgentReview[];
    releaseDate: string;
    isLimitedEdition: boolean;
    limitedUntil?: string; // FOMO: expires
    version: string;
    tags: string[];
}

export interface AgentReview {
    userId: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    verified: boolean;
    helpful: number; // upvotes
}

export interface GachaPull {
    type: 'single' | 'ten-pull';
    cost: number;
    guaranteedRarity?: AgentRarity;
}

export class MarketplaceService {
    private agents: Map<string, MarketplaceAgent> = new Map();

    /**
     * Get featured agents (FOMO - changes weekly)
     */
    getFeaturedAgents(): MarketplaceAgent[] {
        const featured = Array.from(this.agents.values())
            .filter(a => a.isLimitedEdition)
            .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
            .slice(0, 5);
        return featured;
    }

    /**
     * Gacha pull - random agent based on rarity rates
     */
    gachaPull(type: GachaPull['type']): MarketplaceAgent[] {
        const pulls = type === 'single' ? 1 : 10;
        const results: MarketplaceAgent[] = [];

        // Gacha rates
        const rates = {
            [AgentRarity.COMMON]: 0.50,    // 50%
            [AgentRarity.RARE]: 0.30,      // 30%
            [AgentRarity.EPIC]: 0.15,      // 15%
            [AgentRarity.LEGENDARY]: 0.045, // 4.5%
            [AgentRarity.MYTHIC]: 0.005    // 0.5%
        };

        for (let i = 0; i < pulls; i++) {
            // Guaranteed epic+ on 10th pull
            if (type === 'ten-pull' && i === 9) {
                results.push(this.getRandomAgentByMinRarity(AgentRarity.EPIC));
            } else {
                results.push(this.getRandomAgentByRates(rates));
            }
        }

        return results;
    }

    /**
     * Get agent by rarity rates
     */
    private getRandomAgentByRates(rates: Record<AgentRarity, number>): MarketplaceAgent {
        const roll = Math.random();
        let cumulative = 0;

        for (const [rarity, rate] of Object.entries(rates)) {
            cumulative += rate;
            if (roll <= cumulative) {
                return this.getRandomAgentByMinRarity(rarity as AgentRarity);
            }
        }

        return this.getRandomAgentByMinRarity(AgentRarity.COMMON);
    }

    /**
     * Get random agent of at least minimum rarity
     */
    private getRandomAgentByMinRarity(minRarity: AgentRarity): MarketplaceAgent {
        const rarityOrder = [
            AgentRarity.COMMON,
            AgentRarity.RARE,
            AgentRarity.EPIC,
            AgentRarity.LEGENDARY,
            AgentRarity.MYTHIC
        ];

        const minIndex = rarityOrder.indexOf(minRarity);
        const eligible = Array.from(this.agents.values())
            .filter(a => rarityOrder.indexOf(a.rarity) >= minIndex);

        return eligible[Math.floor(Math.random() * eligible.length)];
    }

    /**
     * Purchase agent with specific license
     */
    async purchaseAgent(
        agentId: string,
        license: AgentLicense,
        userId: string
    ): Promise<{ success: boolean; fshPath: string }> {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error('Agent not found');

        // Check if limited edition expired
        if (agent.isLimitedEdition && agent.limitedUntil) {
            if (new Date() > new Date(agent.limitedUntil)) {
                throw new Error('Limited edition expired');
            }
        }

        // Process payment (placeholder)
        const price = agent.price[license];
        // TODO: Integrate payment processor

        // Grant access
        await this.grantAgentAccess(userId, agentId, license);

        // Increment downloads
        agent.downloads++;

        return {
            success: true,
            fshPath: agent.fshFile
        };
    }

    /**
     * Grant user access to agent
     */
    private async grantAgentAccess(
        userId: string,
        agentId: string,
        license: AgentLicense
    ): Promise<void> {
        // TODO: Store in database
        console.log(`[Marketplace] Granted ${license} access to ${agentId} for user ${userId}`);
    }

    /**
     * Submit review
     */
    async submitReview(
        agentId: string,
        userId: string,
        rating: number,
        comment: string
    ): Promise<void> {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error('Agent not found');

        const review: AgentReview = {
            userId,
            rating,
            comment,
            date: new Date().toISOString(),
            verified: true, // Verify user owns agent
            helpful: 0
        };

        agent.reviews.push(review);

        // Recalculate average rating
        agent.rating = agent.reviews.reduce((sum, r) => sum + r.rating, 0) / agent.reviews.length;
    }

    /**
     * Get trending agents (most downloads this week)
     */
    getTrendingAgents(): MarketplaceAgent[] {
        return Array.from(this.agents.values())
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 10);
    }

    /**
     * Search agents
     */
    searchAgents(query: string, filters?: {
        rarity?: AgentRarity;
        maxPrice?: number;
        tags?: string[];
    }): MarketplaceAgent[] {
        let results = Array.from(this.agents.values());

        // Text search
        if (query) {
            results = results.filter(a =>
                a.name.toLowerCase().includes(query.toLowerCase()) ||
                a.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
            );
        }

        // Filters
        if (filters?.rarity) {
            results = results.filter(a => a.rarity === filters.rarity);
        }

        if (filters?.maxPrice) {
            results = results.filter(a => a.price.personal <= filters.maxPrice!);
        }

        if (filters?.tags) {
            results = results.filter(a =>
                filters.tags!.some(t => a.tags.includes(t))
            );
        }

        return results;
    }
}

export const marketplace = new MarketplaceService();
