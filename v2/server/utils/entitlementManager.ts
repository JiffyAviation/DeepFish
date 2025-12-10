/**
 * Entitlement System
 * Manages user access to bots, rooms, items, features
 * 
 * SCALE PATH:
 * - Phase 1 (< 10k users): JSON files ✓
 * - Phase 2 (10k-100k): Add Redis cache (uncomment REDIS section)
 * - Phase 3 (> 100k): Migrate to database (uncomment DATABASE section)
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

export type Tier = 'free' | 'pro' | 'enterprise';

export interface UserEntitlements {
    userId: string;
    email: string;
    tier: Tier;
    createdAt: Date;
    lastModified: Date;
    features: {
        bots: Record<string, boolean>;
        rooms: Record<string, boolean>;
        items: Record<string, boolean>;
        capabilities: {
            voiceCalls: boolean;
            vrAccess: boolean;
            apiAccess: boolean;
            customBots: boolean;
        };
    };
}

export class EntitlementManager {
    private entitlementsDir = './data/entitlements/users';
    private indexPath = './data/entitlements/index.json';
    private cache = new Map<string, UserEntitlements>();

    // ═══════════════════════════════════════════════════════
    // PHASE 1: JSON FILES (Current)
    // ═══════════════════════════════════════════════════════

    constructor() {
        this.ensureDirectories();
    }

    private async ensureDirectories(): Promise<void> {
        await fs.mkdir(this.entitlementsDir, { recursive: true });
        await fs.mkdir('./data/entitlements/backups', { recursive: true });
    }

    /**
     * Get user entitlements
     */
    async getEntitlements(userId: string): Promise<UserEntitlements> {
        // Check cache first
        if (this.cache.has(userId)) {
            return this.cache.get(userId)!;
        }

        // Load from file
        const filePath = path.join(this.entitlementsDir, `${userId}.json`);

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const entitlements: UserEntitlements = JSON.parse(content);

            // Cache it
            this.cache.set(userId, entitlements);

            return entitlements;
        } catch (error) {
            // User doesn't exist - create default free tier
            return this.createUser(userId, 'user@example.com', 'free');
        }
    }

    /**
     * Create new user with default entitlements
     */
    async createUser(userId: string, email: string, tier: Tier = 'free'): Promise<UserEntitlements> {
        const entitlements: UserEntitlements = {
            userId,
            email,
            tier,
            createdAt: new Date(),
            lastModified: new Date(),
            features: this.getDefaultFeatures(tier)
        };

        await this.saveEntitlements(entitlements);

        logger.info(`[Entitlements] Created user ${userId} (${tier})`);

        return entitlements;
    }

    /**
     * Save entitlements to file
     */
    private async saveEntitlements(entitlements: UserEntitlements): Promise<void> {
        const filePath = path.join(this.entitlementsDir, `${entitlements.userId}.json`);

        // Update timestamp
        entitlements.lastModified = new Date();

        // Save to file
        await fs.writeFile(filePath, JSON.stringify(entitlements, null, 2));

        // Update cache
        this.cache.set(entitlements.userId, entitlements);

        // Update index
        await this.updateIndex(entitlements.userId, entitlements.tier);
    }

    /**
     * Update index file (for fast lookups)
     */
    private async updateIndex(userId: string, tier: Tier): Promise<void> {
        let index: Record<string, any> = {};

        try {
            const content = await fs.readFile(this.indexPath, 'utf-8');
            index = JSON.parse(content);
        } catch {
            // Index doesn't exist yet
        }

        index[userId] = {
            tier,
            lastModified: new Date().toISOString()
        };

        await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2));
    }

    /**
     * Check if user has access to feature
     */
    async hasAccess(userId: string, category: 'bots' | 'rooms' | 'items', featureId: string): Promise<boolean> {
        const entitlements = await this.getEntitlements(userId);
        return entitlements.features[category][featureId] === true;
    }

    /**
     * Check if user has capability
     */
    async hasCapability(userId: string, capability: keyof UserEntitlements['features']['capabilities']): Promise<boolean> {
        const entitlements = await this.getEntitlements(userId);
        return entitlements.features.capabilities[capability] === true;
    }

    /**
     * Grant access to feature (purchase/gift)
     */
    async grantAccess(userId: string, category: 'bots' | 'rooms' | 'items', featureId: string): Promise<void> {
        const entitlements = await this.getEntitlements(userId);
        entitlements.features[category][featureId] = true;
        await this.saveEntitlements(entitlements);

        logger.info(`[Entitlements] Granted ${category}/${featureId} to ${userId}`);
    }

    /**
     * Revoke access (refund/expire)
     */
    async revokeAccess(userId: string, category: 'bots' | 'rooms' | 'items', featureId: string): Promise<void> {
        const entitlements = await this.getEntitlements(userId);
        entitlements.features[category][featureId] = false;
        await this.saveEntitlements(entitlements);

        logger.info(`[Entitlements] Revoked ${category}/${featureId} from ${userId}`);
    }

    /**
     * Upgrade user tier
     */
    async upgradeTier(userId: string, newTier: Tier): Promise<void> {
        const entitlements = await this.getEntitlements(userId);
        entitlements.tier = newTier;
        entitlements.features = this.getDefaultFeatures(newTier);
        await this.saveEntitlements(entitlements);

        logger.info(`[Entitlements] Upgraded ${userId} to ${newTier}`);
    }

    /**
     * Get default features for tier
     */
    private getDefaultFeatures(tier: Tier): UserEntitlements['features'] {
        const features: UserEntitlements['features'] = {
            bots: {
                mei: true,
                vesper: true,
                hanna: tier !== 'free',
                oracle: tier === 'enterprise',
                skillz: tier === 'enterprise'
            },
            rooms: {
                lobby: true,
                conference: true,
                lunch: true,
                exec: tier !== 'free',
                it: tier === 'enterprise'
            },
            items: {
                'meis-clipboard': true,
                'vespers-phone': true,
                'hannas-portfolio': tier !== 'free'
            },
            capabilities: {
                voiceCalls: tier !== 'free',
                vrAccess: tier === 'enterprise',
                apiAccess: tier === 'enterprise',
                customBots: tier === 'enterprise'
            }
        };

        return features;
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 2: REDIS CACHE (Uncomment when scaling)
    // ═══════════════════════════════════════════════════════

    /*
    private redis: Redis;
  
    async getEntitlementsWithRedis(userId: string): Promise<UserEntitlements> {
      // Try Redis first
      const cached = await this.redis.get(`entitlements:${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
  
      // Fall back to file
      const entitlements = await this.getEntitlements(userId);
      
      // Cache in Redis (1 hour TTL)
      await this.redis.setex(`entitlements:${userId}`, 3600, JSON.stringify(entitlements));
      
      return entitlements;
    }
    */

    // ═══════════════════════════════════════════════════════
    // PHASE 3: DATABASE (Uncomment when > 100k users)
    // ═══════════════════════════════════════════════════════

    /*
    private db: Database;
  
    async getEntitlementsFromDB(userId: string): Promise<UserEntitlements> {
      const result = await this.db.query(
        'SELECT * FROM user_entitlements WHERE user_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return this.createUser(userId, 'user@example.com', 'free');
      }
      
      return this.parseDBRow(result.rows[0]);
    }
  
    async saveEntitlementsToDb(entitlements: UserEntitlements): Promise<void> {
      await this.db.query(
        `INSERT INTO user_entitlements (user_id, email, tier, features, last_modified)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE
         SET tier = $3, features = $4, last_modified = $5`,
        [
          entitlements.userId,
          entitlements.email,
          entitlements.tier,
          JSON.stringify(entitlements.features),
          new Date()
        ]
      );
    }
    */
}

// Global instance
export const entitlementManager = new EntitlementManager();
