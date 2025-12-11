/**
 * Asset Bus - Inter-Bot Communication System
 * Bots pass work to each other via asset tokens
 * Clean, efficient data sharing without global state pollution
 */

export enum AssetType {
    DESIGN = 'design',
    CODE = 'code',
    DATA = 'data',
    DOCUMENT = 'document',
    IMAGE = 'image',
    ANALYSIS = 'analysis',
    PLAN = 'plan'
}

export interface Asset {
    id: string; // Token ID
    type: AssetType;
    createdBy: string; // Bot ID
    createdAt: string;
    data: any; // Asset payload
    metadata: {
        title: string;
        description?: string;
        tags?: string[];
        version?: string;
    };
    recipients?: string[]; // Target bot IDs
    expiresAt?: string; // Optional expiration
}

export interface AssetTransfer {
    assetId: string;
    from: string; // Bot ID
    to: string; // Bot ID
    timestamp: string;
    message?: string; // Optional handoff note
}

/**
 * Asset Bus Service
 * Central hub for inter-bot asset sharing
 */
export class AssetBusService {
    private assets: Map<string, Asset> = new Map();
    private transfers: AssetTransfer[] = [];

    /**
     * Create and publish asset
     * Returns token ID for other bots to reference
     */
    publishAsset(
        botId: string,
        type: AssetType,
        data: any,
        metadata: Asset['metadata'],
        recipients?: string[]
    ): string {
        const assetId = this.generateTokenId();

        const asset: Asset = {
            id: assetId,
            type,
            createdBy: botId,
            createdAt: new Date().toISOString(),
            data,
            metadata,
            recipients
        };

        this.assets.set(assetId, asset);

        console.log(`[AssetBus] ${botId} published ${type} asset: ${assetId}`);

        return assetId;
    }

    /**
     * Retrieve asset by token ID
     */
    getAsset(assetId: string, requestingBotId: string): Asset | null {
        const asset = this.assets.get(assetId);

        if (!asset) {
            console.warn(`[AssetBus] Asset ${assetId} not found`);
            return null;
        }

        // Check expiration
        if (asset.expiresAt && new Date() > new Date(asset.expiresAt)) {
            console.warn(`[AssetBus] Asset ${assetId} expired`);
            this.assets.delete(assetId);
            return null;
        }

        // Check permissions (if recipients specified)
        if (asset.recipients && !asset.recipients.includes(requestingBotId)) {
            console.warn(`[AssetBus] Bot ${requestingBotId} not authorized for asset ${assetId}`);
            return null;
        }

        console.log(`[AssetBus] ${requestingBotId} retrieved asset ${assetId}`);

        return asset;
    }

    /**
     * Transfer asset from one bot to another
     */
    transferAsset(
        assetId: string,
        fromBotId: string,
        toBotId: string,
        message?: string
    ): boolean {
        const asset = this.assets.get(assetId);

        if (!asset) return false;

        // Verify ownership
        if (asset.createdBy !== fromBotId) {
            console.warn(`[AssetBus] Bot ${fromBotId} doesn't own asset ${assetId}`);
            return false;
        }

        // Record transfer
        const transfer: AssetTransfer = {
            assetId,
            from: fromBotId,
            to: toBotId,
            timestamp: new Date().toISOString(),
            message
        };

        this.transfers.push(transfer);

        // Update recipients
        if (!asset.recipients) {
            asset.recipients = [];
        }
        if (!asset.recipients.includes(toBotId)) {
            asset.recipients.push(toBotId);
        }

        console.log(`[AssetBus] ${fromBotId} → ${toBotId}: ${assetId}`);
        if (message) console.log(`  Message: ${message}`);

        return true;
    }

    /**
     * Get all assets created by a bot
     */
    getBotAssets(botId: string): Asset[] {
        return Array.from(this.assets.values())
            .filter(a => a.createdBy === botId);
    }

    /**
     * Get recent transfers
     */
    getRecentTransfers(limit: number = 10): AssetTransfer[] {
        return this.transfers.slice(-limit);
    }

    /**
     * Generate unique token ID
     */
    private generateTokenId(): string {
        return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clean up expired assets (call periodically)
     */
    cleanupExpired(): void {
        const now = new Date();
        let cleaned = 0;

        for (const [id, asset] of this.assets.entries()) {
            if (asset.expiresAt && now > new Date(asset.expiresAt)) {
                this.assets.delete(id);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[AssetBus] Cleaned up ${cleaned} expired assets`);
        }
    }
}

/**
 * Example Bot Workflow using Asset Bus
 */
export class BotWorkflow {
    constructor(private assetBus: AssetBusService) { }

    /**
     * Example: Hanna creates design, passes to Skillz
     */
    async hannaToSkillzWorkflow() {
        // 1. Hanna creates design
        const designAssetId = this.assetBus.publishAsset(
            'hanna',
            AssetType.DESIGN,
            {
                mockup: 'dashboard-design.png',
                figmaUrl: 'https://figma.com/...',
                specifications: {
                    layout: 'grid',
                    colors: ['#1a3a52', '#ff6b6b'],
                    components: ['header', 'sidebar', 'main']
                }
            },
            {
                title: 'Dashboard Design v1.0',
                description: 'Minimalist dashboard for B2B fintech',
                tags: ['design', 'dashboard', 'fintech']
            },
            ['skillz'] // Only Skillz can access
        );

        console.log(`[Hanna] Created design: ${designAssetId}`);

        // 2. Transfer to Skillz
        this.assetBus.transferAsset(
            designAssetId,
            'hanna',
            'skillz',
            'Ready for implementation. See Figma for all specs.'
        );

        // 3. Skillz retrieves design
        const design = this.assetBus.getAsset(designAssetId, 'skillz');

        if (design) {
            console.log(`[Skillz] Received design from Hanna`);

            // 4. Skillz implements code
            const codeAssetId = this.assetBus.publishAsset(
                'skillz',
                AssetType.CODE,
                {
                    repository: 'github.com/...',
                    components: ['Dashboard.tsx', 'Sidebar.tsx', 'Header.tsx'],
                    status: 'ready-for-review'
                },
                {
                    title: 'Dashboard Implementation',
                    description: 'Based on Hanna\'s design',
                    tags: ['code', 'react', 'dashboard']
                },
                ['hanna', 'igor'] // Hanna reviews, Igor deploys
            );

            console.log(`[Skillz] Code ready: ${codeAssetId}`);

            // 5. Transfer to Igor for deployment
            this.assetBus.transferAsset(
                codeAssetId,
                'skillz',
                'igor',
                'Code tested and ready for deployment'
            );
        }
    }

    /**
     * Example: Mei coordinates multi-bot project
     */
    async meiCoordinatesProject() {
        // 1. Mei creates project plan
        const planAssetId = this.assetBus.publishAsset(
            'mei',
            AssetType.PLAN,
            {
                projectId: 'rocket-001',
                phases: [
                    { phase: 1, assignee: 'hanna', task: 'Design UI' },
                    { phase: 2, assignee: 'skillz', task: 'Implement frontend' },
                    { phase: 3, assignee: 'igor', task: 'Deploy to production' }
                ],
                deadline: '2025-01-15'
            },
            {
                title: 'Project Rocket Launch Plan',
                description: 'Multi-phase project coordination'
            },
            ['hanna', 'skillz', 'igor'] // All team members
        );

        console.log(`[Mei] Project plan created: ${planAssetId}`);

        // 2. Distribute to team
        this.assetBus.transferAsset(planAssetId, 'mei', 'hanna', 'Phase 1 is yours');
        this.assetBus.transferAsset(planAssetId, 'mei', 'skillz', 'Phase 2 after Hanna');
        this.assetBus.transferAsset(planAssetId, 'mei', 'igor', 'Phase 3 - deployment');
    }
}

// Singleton instance
export const assetBus = new AssetBusService();

// Cleanup expired assets every hour
setInterval(() => assetBus.cleanupExpired(), 60 * 60 * 1000);
