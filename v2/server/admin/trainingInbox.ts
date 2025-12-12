/**
 * Admin Dashboard - Training Inbox Processor
 * View and manage Oracle's training materials
 */

import { readdir, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

interface TrainingMaterial {
    type: 'youtube' | 'pdf' | 'url' | 'text';
    source: string;
    topic: string;
    notes?: string;
    timestamp: number;
}

export class TrainingInboxProcessor {
    private inboxPath = join(process.cwd(), 'data', 'training', 'inbox');

    /**
     * Get all training materials for all bots
     */
    async getAllTrainingMaterials(): Promise<Record<string, TrainingMaterial[]>> {
        const bots = ['oracle', 'mei', 'julie', 'gladyce', 'hanna', 'vesper'];
        const materials: Record<string, TrainingMaterial[]> = {};

        for (const botId of bots) {
            materials[botId] = await this.getBotTraining(botId);
        }

        return materials;
    }

    /**
     * Get training materials for a specific bot
     */
    async getBotTraining(botId: string): Promise<TrainingMaterial[]> {
        const botInbox = join(this.inboxPath, botId);

        if (!existsSync(botInbox)) {
            return [];
        }

        const files = await readdir(botInbox);
        const materials: TrainingMaterial[] = [];

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            const content = await readFile(join(botInbox, file), 'utf-8');
            const material = JSON.parse(content);
            material.timestamp = parseInt(file.split('-')[0]);
            materials.push(material);
        }

        return materials.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Delete a training material
     */
    async deleteTrainingMaterial(botId: string, timestamp: number): Promise<void> {
        const botInbox = join(this.inboxPath, botId);
        const files = await readdir(botInbox);

        const file = files.find(f => f.startsWith(timestamp.toString()));
        if (!file) {
            throw new Error(`Training material not found: ${timestamp}`);
        }

        await unlink(join(botInbox, file));
        logger.info(`[Admin] Deleted training material for ${botId}: ${timestamp}`);
    }

    /**
     * Get training statistics
     */
    async getTrainingStats(): Promise<{
        totalMaterials: number;
        byBot: Record<string, number>;
        byType: Record<string, number>;
    }> {
        const allMaterials = await this.getAllTrainingMaterials();

        const stats = {
            totalMaterials: 0,
            byBot: {} as Record<string, number>,
            byType: {} as Record<string, number>
        };

        for (const [botId, materials] of Object.entries(allMaterials)) {
            stats.byBot[botId] = materials.length;
            stats.totalMaterials += materials.length;

            for (const material of materials) {
                stats.byType[material.type] = (stats.byType[material.type] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * Clear all training for a bot (processed)
     */
    async clearBotTraining(botId: string): Promise<number> {
        const materials = await this.getBotTraining(botId);

        for (const material of materials) {
            await this.deleteTrainingMaterial(botId, material.timestamp);
        }

        logger.info(`[Admin] Cleared ${materials.length} training materials for ${botId}`);
        return materials.length;
    }
}

// Singleton
export const trainingInbox = new TrainingInboxProcessor();
