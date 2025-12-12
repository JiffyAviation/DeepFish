/**
 * Manual Training Interface
 * Allows user to manually add training materials to any bot's inbox
 */

import { writeFile, mkdir, readFile, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

interface TrainingMaterial {
    type: 'file' | 'url' | 'text' | 'youtube' | 'pdf';
    source: string;
    topic: string;
    notes?: string;
    addedBy: 'user' | 'oracle';
}

export class ManualTrainingInterface {
    private trainingDir = join(process.cwd(), 'data', 'training', 'inbox');

    /**
     * Add file to bot's training inbox
     */
    async addFile(
        botId: string,
        filePath: string,
        topic: string,
        notes?: string
    ): Promise<void> {
        const botInbox = join(this.trainingDir, botId);

        if (!existsSync(botInbox)) {
            await mkdir(botInbox, { recursive: true });
        }

        // Copy file to inbox
        const timestamp = Date.now();
        const fileName = filePath.split(/[\\/]/).pop() || 'file';
        const destPath = join(botInbox, `${timestamp}-${fileName}`);

        await copyFile(filePath, destPath);

        // Create metadata
        const material: TrainingMaterial = {
            type: 'file',
            source: destPath,
            topic,
            notes,
            addedBy: 'user'
        };

        const metaPath = join(botInbox, `${timestamp}-metadata.json`);
        await writeFile(metaPath, JSON.stringify(material, null, 2));

        logger.info(`[Training] Added file to ${botId}: ${topic}`);
    }

    /**
     * Add URL to bot's training inbox
     */
    async addURL(
        botId: string,
        url: string,
        topic: string,
        notes?: string
    ): Promise<void> {
        const botInbox = join(this.trainingDir, botId);

        if (!existsSync(botInbox)) {
            await mkdir(botInbox, { recursive: true });
        }

        const timestamp = Date.now();

        // Detect type
        let type: TrainingMaterial['type'] = 'url';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            type = 'youtube';
        }

        const material: TrainingMaterial = {
            type,
            source: url,
            topic,
            notes,
            addedBy: 'user'
        };

        const filePath = join(botInbox, `${timestamp}-${type}.json`);
        await writeFile(filePath, JSON.stringify(material, null, 2));

        logger.info(`[Training] Added ${type} to ${botId}: ${topic}`);
    }

    /**
     * Add text/paste content to bot's training inbox
     */
    async addText(
        botId: string,
        text: string,
        topic: string,
        notes?: string
    ): Promise<void> {
        const botInbox = join(this.trainingDir, botId);

        if (!existsSync(botInbox)) {
            await mkdir(botInbox, { recursive: true });
        }

        const timestamp = Date.now();

        const material: TrainingMaterial = {
            type: 'text',
            source: text,
            topic,
            notes,
            addedBy: 'user'
        };

        const filePath = join(botInbox, `${timestamp}-text.json`);
        await writeFile(filePath, JSON.stringify(material, null, 2));

        logger.info(`[Training] Added text to ${botId}: ${topic}`);
    }

    /**
     * List all training materials for a bot
     */
    async listTraining(botId: string): Promise<TrainingMaterial[]> {
        const botInbox = join(this.trainingDir, botId);

        if (!existsSync(botInbox)) {
            return [];
        }

        const { readdir } = await import('fs/promises');
        const files = await readdir(botInbox);
        const materials: TrainingMaterial[] = [];

        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            if (file.includes('metadata')) continue;

            const content = await readFile(join(botInbox, file), 'utf-8');
            materials.push(JSON.parse(content));
        }

        return materials.sort((a, b) => {
            const aTime = parseInt(a.source.split('-')[0] || '0');
            const bTime = parseInt(b.source.split('-')[0] || '0');
            return bTime - aTime;
        });
    }

    /**
     * Get training statistics
     */
    async getTrainingStats(botId: string): Promise<{
        total: number;
        byUser: number;
        byOracle: number;
        byType: Record<string, number>;
    }> {
        const materials = await this.listTraining(botId);

        const stats = {
            total: materials.length,
            byUser: materials.filter(m => m.addedBy === 'user').length,
            byOracle: materials.filter(m => m.addedBy === 'oracle').length,
            byType: {} as Record<string, number>
        };

        for (const material of materials) {
            stats.byType[material.type] = (stats.byType[material.type] || 0) + 1;
        }

        return stats;
    }
}

// Singleton
export const manualTraining = new ManualTrainingInterface();

/**
 * Example usage:
 * 
 * // Add file
 * await manualTraining.addFile('oracle', '/path/to/doc.pdf', 'System Design Patterns');
 * 
 * // Add URL
 * await manualTraining.addURL('mei', 'https://example.com/article', 'Project Management Tips');
 * 
 * // Add text
 * await manualTraining.addText('julie', 'Cost optimization strategies...', 'Financial Best Practices');
 */
