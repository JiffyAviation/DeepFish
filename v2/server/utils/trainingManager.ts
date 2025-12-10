/**
 * Training Manager
 * Manages bot training materials and queues
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

export interface TrainingMaterial {
    id: string;
    botId: string;
    type: 'text' | 'url' | 'file';
    content: string;
    description?: string;
    priority: 'immediate' | 'high' | 'normal';
    addedAt: string;
    addedBy: string;
    status: 'pending' | 'processing' | 'complete';
}

export class TrainingManager {
    private trainingDir = path.join(process.cwd(), 'data', 'training');

    /**
     * Get training queue file path
     */
    private getQueuePath(): string {
        return path.join(this.trainingDir, 'queue.json');
    }

    /**
     * Load training queue
     */
    async loadQueue(): Promise<TrainingMaterial[]> {
        try {
            const queuePath = this.getQueuePath();
            const content = await fs.readFile(queuePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return [];
        }
    }

    /**
     * Save training queue
     */
    async saveQueue(queue: TrainingMaterial[]): Promise<void> {
        const queuePath = this.getQueuePath();

        // Ensure directory exists
        await fs.mkdir(path.dirname(queuePath), { recursive: true });

        // Save queue
        await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
    }

    /**
     * Add training material
     */
    async addTraining(material: Omit<TrainingMaterial, 'id' | 'addedAt' | 'status'>): Promise<string> {
        const queue = await this.loadQueue();

        const newMaterial: TrainingMaterial = {
            ...material,
            id: `train-${Date.now()}`,
            addedAt: new Date().toISOString(),
            status: 'pending'
        };

        queue.push(newMaterial);
        await this.saveQueue(queue);

        logger.info(`[TrainingManager] Added training material for ${material.botId}`);

        return newMaterial.id;
    }

    /**
     * Get training queue for specific bot
     */
    async getBotQueue(botId: string): Promise<TrainingMaterial[]> {
        const queue = await this.loadQueue();
        return queue.filter(m => m.botId === botId);
    }

    /**
     * Get all pending training
     */
    async getPendingTraining(): Promise<TrainingMaterial[]> {
        const queue = await this.loadQueue();
        return queue.filter(m => m.status === 'pending');
    }

    /**
     * Update training status
     */
    async updateStatus(id: string, status: TrainingMaterial['status']): Promise<void> {
        const queue = await this.loadQueue();
        const material = queue.find(m => m.id === id);

        if (material) {
            material.status = status;
            await this.saveQueue(queue);
        }
    }
}

// Singleton instance
export const trainingManager = new TrainingManager();
