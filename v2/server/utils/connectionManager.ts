/**
 * Connection Manager
 * Manages external connections (AI providers, websockets, etc.)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';
import { logger } from './logger.js';

export class ConnectionManager {
    private geminiClient?: GoogleGenerativeAI;
    private anthropicClient?: Anthropic;
    private activeConnections = new Set<string>();

    constructor() {
        this.initializeClients();
    }

    /**
     * Initialize AI provider clients
     */
    private initializeClients(): void {
        // Initialize Gemini if key available
        if (config.GEMINI_API_KEY) {
            try {
                this.geminiClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
                logger.info('[ConnectionManager] Gemini client initialized');
            } catch (error) {
                logger.error('[ConnectionManager] Failed to initialize Gemini:', error);
            }
        }

        // Initialize Anthropic if key available
        if (config.ANTHROPIC_API_KEY) {
            try {
                this.anthropicClient = new Anthropic({
                    apiKey: config.ANTHROPIC_API_KEY
                });
                logger.info('[ConnectionManager] Anthropic client initialized');
            } catch (error) {
                logger.error('[ConnectionManager] Failed to initialize Anthropic:', error);
            }
        }
    }

    /**
     * Get Gemini client
     */
    getGeminiClient(): GoogleGenerativeAI {
        if (!this.geminiClient) {
            throw new Error('Gemini client not available - check API key');
        }
        return this.geminiClient;
    }

    /**
     * Get Anthropic client
     */
    getAnthropicClient(): Anthropic {
        if (!this.anthropicClient) {
            throw new Error('Anthropic client not available - check API key');
        }
        return this.anthropicClient;
    }

    /**
     * Check if provider is available
     */
    isProviderAvailable(provider: 'gemini' | 'anthropic'): boolean {
        if (provider === 'gemini') return !!this.geminiClient;
        if (provider === 'anthropic') return !!this.anthropicClient;
        return false;
    }

    /**
     * Track active connection
     */
    trackConnection(connectionId: string): void {
        this.activeConnections.add(connectionId);
    }

    /**
     * Untrack connection
     */
    untrackConnection(connectionId: string): void {
        this.activeConnections.delete(connectionId);
    }

    /**
     * Get connection stats
     */
    getStats() {
        return {
            geminiAvailable: !!this.geminiClient,
            anthropicAvailable: !!this.anthropicClient,
            activeConnections: this.activeConnections.size
        };
    }
}
