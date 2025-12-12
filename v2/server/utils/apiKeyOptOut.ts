/**
 * API Key Opt-Out Manager
 * Allows users to opt out of specific LLM provider recommendations
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

interface OptOutPreferences {
    optedOut: string[];  // List of providers user opted out of
    lastUpdated: number;
}

export class APIKeyOptOut {
    private prefsPath = join(process.cwd(), 'data', 'user', 'api-opt-outs.json');

    /**
     * Load opt-out preferences
     */
    private async loadPreferences(): Promise<OptOutPreferences> {
        if (!existsSync(this.prefsPath)) {
            return { optedOut: [], lastUpdated: Date.now() };
        }

        const content = await readFile(this.prefsPath, 'utf-8');
        return JSON.parse(content);
    }

    /**
     * Save opt-out preferences
     */
    private async savePreferences(prefs: OptOutPreferences): Promise<void> {
        const dir = join(process.cwd(), 'data', 'user');
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }

        prefs.lastUpdated = Date.now();
        await writeFile(this.prefsPath, JSON.stringify(prefs, null, 2));
    }

    /**
     * Opt out of a provider
     */
    async optOut(provider: string, reason?: string): Promise<void> {
        const prefs = await this.loadPreferences();

        if (!prefs.optedOut.includes(provider)) {
            prefs.optedOut.push(provider);
            await this.savePreferences(prefs);

            logger.info(`[API] User opted out of ${provider}${reason ? `: ${reason}` : ''}`);
        }
    }

    /**
     * Opt back in to a provider
     */
    async optIn(provider: string): Promise<void> {
        const prefs = await this.loadPreferences();

        prefs.optedOut = prefs.optedOut.filter(p => p !== provider);
        await this.savePreferences(prefs);

        logger.info(`[API] User opted back in to ${provider}`);
    }

    /**
     * Check if user opted out of a provider
     */
    async isOptedOut(provider: string): Promise<boolean> {
        const prefs = await this.loadPreferences();
        return prefs.optedOut.includes(provider);
    }

    /**
     * Get all opted-out providers
     */
    async getOptedOut(): Promise<string[]> {
        const prefs = await this.loadPreferences();
        return prefs.optedOut;
    }

    /**
     * Filter out opted-out providers from recommendations
     */
    async filterRecommendations(providers: string[]): Promise<string[]> {
        const optedOut = await this.getOptedOut();
        return providers.filter(p => !optedOut.includes(p));
    }
}

// Singleton
export const apiKeyOptOut = new APIKeyOptOut();
