/**
 * Bot Integration with Asset Bus
 * Helper methods for bots to use Asset Bus easily
 */

import { assetBus, AssetType } from './assetBusService';

/**
 * Bot Asset Helper
 * Mixin for bot classes to easily use Asset Bus
 */
export class BotAssetHelper {
    constructor(private botId: string) { }

    /**
     * Publish asset and notify recipients
     */
    publish(
        type: AssetType,
        data: any,
        metadata: { title: string; description?: string },
        recipientBots?: string[]
    ): string {
        return assetBus.publishAsset(
            this.botId,
            type,
            data,
            metadata,
            recipientBots
        );
    }

    /**
     * Send asset to another bot
     */
    sendTo(assetId: string, recipientBotId: string, message?: string): boolean {
        return assetBus.transferAsset(
            assetId,
            this.botId,
            recipientBotId,
            message
        );
    }

    /**
     * Receive asset from another bot
     */
    receive(assetId: string) {
        return assetBus.getAsset(assetId, this.botId);
    }

    /**
     * Get my published assets
     */
    getMyAssets() {
        return assetBus.getBotAssets(this.botId);
    }
}

/**
 * Example: Integrate Asset Bus into Bot class
 */
export class BotWithAssets {
    private assetHelper: BotAssetHelper;

    constructor(private botId: string) {
        this.assetHelper = new BotAssetHelper(botId);
    }

    /**
     * Bot generates response and may create assets
     */
    async generateResponse(userMessage: string): Promise<{
        text: string;
        assetIds?: string[];
    }> {
        // Bot processes message...
        const response = "I've created a design for you!";

        // If bot creates deliverable, publish as asset
        const assetIds: string[] = [];

        if (this.botId === 'hanna') {
            // Hanna creates design asset
            const designId = this.assetHelper.publish(
                AssetType.DESIGN,
                { mockup: 'design.png', figmaUrl: '...' },
                { title: 'Dashboard Design', description: 'User requested design' }
            );

            assetIds.push(designId);
        }

        return { text: response, assetIds };
    }

    /**
     * Bot receives work from another bot
     */
    async processAsset(assetId: string) {
        const asset = this.assetHelper.receive(assetId);

        if (!asset) {
            console.log(`[${this.botId}] Asset ${assetId} not accessible`);
            return;
        }

        console.log(`[${this.botId}] Processing ${asset.type} from ${asset.createdBy}`);

        // Process based on asset type
        switch (asset.type) {
            case AssetType.DESIGN:
                // Implement design
                break;
            case AssetType.CODE:
                // Review or deploy code
                break;
            case AssetType.PLAN:
                // Execute plan
                break;
        }
    }
}
