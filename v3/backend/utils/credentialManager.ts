/**
 * Credential Manager
 * Manages user API keys for LLM providers
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

export interface UserCredentials {
    userId: string;
    credentials: {
        [provider: string]: {
            apiKey: string;
            enabled: boolean;
            addedAt: string;
        };
    };
    defaultProvider?: string;
}

export class CredentialManager {
    private credentialsDir = path.join(process.cwd(), 'data', 'users');

    /**
     * Get credentials file path for user
     */
    private getCredentialsPath(userId: string): string {
        return path.join(this.credentialsDir, userId, 'credentials.json');
    }

    /**
     * Load user credentials
     */
    async loadCredentials(userId: string): Promise<UserCredentials> {
        try {
            const credPath = this.getCredentialsPath(userId);
            const content = await fs.readFile(credPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            // Return empty credentials if file doesn't exist
            return {
                userId,
                credentials: {}
            };
        }
    }

    /**
     * Save user credentials
     */
    async saveCredentials(creds: UserCredentials): Promise<void> {
        const credPath = this.getCredentialsPath(creds.userId);

        // Ensure directory exists
        await fs.mkdir(path.dirname(credPath), { recursive: true });

        // Save credentials
        await fs.writeFile(credPath, JSON.stringify(creds, null, 2));

        logger.info(`[CredentialManager] Saved credentials for user ${creds.userId}`);
    }

    /**
     * Add API key for provider
     */
    async addCredential(
        userId: string,
        provider: string,
        apiKey: string
    ): Promise<void> {
        const creds = await this.loadCredentials(userId);

        creds.credentials[provider] = {
            apiKey,
            enabled: true,
            addedAt: new Date().toISOString()
        };

        // Set as default if first credential
        if (!creds.defaultProvider) {
            creds.defaultProvider = provider;
        }

        await this.saveCredentials(creds);
    }

    /**
     * Remove API key for provider
     */
    async removeCredential(userId: string, provider: string): Promise<void> {
        const creds = await this.loadCredentials(userId);

        delete creds.credentials[provider];

        // Update default if removed
        if (creds.defaultProvider === provider) {
            const remaining = Object.keys(creds.credentials);
            creds.defaultProvider = remaining.length > 0 ? remaining[0] : undefined;
        }

        await this.saveCredentials(creds);
    }

    /**
     * Get API key for provider
     */
    async getApiKey(userId: string, provider: string): Promise<string | null> {
        const creds = await this.loadCredentials(userId);
        return creds.credentials[provider]?.apiKey || null;
    }

    /**
     * List all credentials for user
     */
    async listCredentials(userId: string): Promise<string[]> {
        const creds = await this.loadCredentials(userId);
        return Object.keys(creds.credentials);
    }

    /**
     * Test API key by making a simple request
     */
    async testCredential(userId: string, provider: string): Promise<boolean> {
        const apiKey = await this.getApiKey(userId, provider);

        if (!apiKey) {
            return false;
        }

        try {
            if (provider === 'gemini') {
                // Test Gemini API
                const { GoogleGenerativeAI } = await import('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

                // Simple test prompt
                await model.generateContent('Hello');
                return true;
            }

            // Add other providers as needed
            return false;
        } catch (error) {
            logger.error(`[CredentialManager] Test failed for ${provider}:`, error);
            return false;
        }
    }
}

// Singleton instance
export const credentialManager = new CredentialManager();
