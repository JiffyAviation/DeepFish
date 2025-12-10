/**
 * Enhanced Message Router (Switchboard) v2
 * THE COMPLETE AIR BUFFER with all resilience features
 */

import { PriorityQueue } from './utils/priorityQueue.js';
import { logger } from './utils/logger.js';
import { RateLimiter } from './utils/rateLimiter.js';
import { ConnectionManager } from './utils/connectionManager.js';
import { CircuitBreaker } from './utils/circuitBreaker.js';
import { MessagePersistence } from './utils/messagePersistence.js';
import { gracefulShutdown } from './utils/gracefulShutdown.js';
import { MessageSanitizer } from './utils/messageSanitizer.js';
import { RequestDeduplicator } from './utils/requestDeduplicator.js';
import { MetricsCollector } from './utils/metricsCollector.js';
import type { UserMessage, IncomingQueueItem, OutgoingQueueItem, BotResponse } from '../types/index.js';

export class MessageRouter {
    // Queues
    private incomingQueue = new PriorityQueue<IncomingQueueItem>();
    private outgoingQueue = new PriorityQueue<OutgoingQueueItem>();
    private pendingResponses = new Map<string, (response: BotResponse | Error) => void>();

    // Core systems
    private orchestrator: any;
    private connectionManager: ConnectionManager;

    // Resilience features
    private rateLimiter: RateLimiter;
    private circuitBreaker: CircuitBreaker;
    private persistence: MessagePersistence;
    private sanitizer: MessageSanitizer;
    private deduplicator: RequestDeduplicator;
    private metrics: MetricsCollector;

    // Traffic log
    private trafficLog: Array<{ direction: 'IN' | 'OUT'; timestamp: string; data: any }> = [];

    constructor() {
        // Initialize all systems
        this.connectionManager = new ConnectionManager();
        this.rateLimiter = new RateLimiter(60);
        this.circuitBreaker = new CircuitBreaker();
        this.persistence = new MessagePersistence();
        this.sanitizer = new MessageSanitizer();
        this.deduplicator = new RequestDeduplicator();
        this.metrics = new MetricsCollector();

        // Start queue processors
        this.processIncomingQueue();
        this.processOutgoingQueue();

        // Load persisted messages
        this.loadPersistedMessages();

        // Register shutdown handler
        gracefulShutdown.onShutdown(async () => {
            logger.info('[Router] Shutting down...');
            await this.persistence.shutdown();
            logger.info('[Router] Shutdown complete');
        });

        // Start metrics monitoring
        this.startMetricsMonitoring();

        logger.info('[Router] ═══════════════════════════════════════');
        logger.info('[Router] Enhanced Message Router v2 ONLINE');
        logger.info('[Router] ✓ Circuit Breaker');
        logger.info('[Router] ✓ Message Persistence');
        logger.info('[Router] ✓ Graceful Shutdown');
        logger.info('[Router] ✓ Message Sanitization');
        logger.info('[Router] ✓ Priority Queuing');
        logger.info('[Router] ✓ Request Deduplication');
        logger.info('[Router] ✓ Metrics Collection');
        logger.info('[Router] ═══════════════════════════════════════');
    }

    setOrchestrator(orchestrator: any) {
        this.orchestrator = orchestrator;
        logger.info('[Router] Connected to Orchestrator');
    }

    /**
     * Receive message from UI
     */
    async receiveFromUI(message: UserMessage, priority: number = 0): Promise<BotResponse> {
        const requestId = this.generateId();
        const startTime = Date.now();

        try {
            // Check if shutting down
            if (gracefulShutdown.isShuttingDownNow()) {
                throw new Error('System is shutting down - please try again later');
            }

            // === CIRCUIT BREAKER ===
            if (!this.circuitBreaker.allowRequest()) {
                throw new Error('System temporarily unavailable - please try again in 30 seconds');
            }

            // === SANITIZATION ===
            const validation = this.sanitizer.validate(message.text);
            if (!validation.valid) {
                throw new Error(validation.reason || 'Invalid message');
            }
            message.text = this.sanitizer.sanitize(message.text);

            // === DEDUPLICATION ===
            const cached = this.deduplicator.getCached(message.userId, message.text);
            if (cached) {
                logger.info(`[Router] ⚡ Returning cached response: ${requestId}`);
                return cached;
            }

            // === VALIDATION ===
            if (!this.validateMessage(message)) {
                throw new Error('Invalid message format');
            }

            // === RATE LIMITING ===
            if (!this.rateLimiter.allow(message.userId)) {
                throw new Error('Rate limit exceeded - please wait before sending more messages');
            }

            // === API KEY CHECK ===
            if (!this.connectionManager.isProviderAvailable('gemini') &&
                !this.connectionManager.isProviderAvailable('anthropic')) {
                throw new Error('No AI providers available - check API keys');
            }

            // === LOGGING ===
            this.logIncoming(requestId, message);
            this.metrics.recordRequest();

            // === PERSISTENCE ===
            await this.persistence.save(requestId, message);

            // === QUEUE MESSAGE ===
            this.incomingQueue.enqueue({
                requestId,
                message,
                timestamp: Date.now()
            }, priority);

            logger.info(`[Router] ✓ Message queued: ${requestId} (priority: ${priority})`);

            // Wait for response
            const response = await this.waitForResponse(requestId);

            // Cache response
            this.deduplicator.cacheResponse(message.userId, message.text, response);

            // Record metrics
            const responseTime = Date.now() - startTime;
            this.metrics.recordResponseTime(responseTime);

            // Remove from persistence
            await this.persistence.remove(requestId);

            // Circuit breaker success
            this.circuitBreaker.recordSuccess();

            return response;

        } catch (error: any) {
            // Record error
            this.metrics.recordError();
            this.circuitBreaker.recordFailure();

            logger.error(`[Router] ✗ Error: ${requestId}`, error.message);
            throw error;
        }
    }

    /**
     * Process incoming queue
     */
    private async processIncomingQueue() {
        while (true) {
            try {
                const item = await this.incomingQueue.dequeue();

                // Record queue depth
                this.metrics.recordQueueDepth(this.incomingQueue.size);

                logger.debug(`[Router] → Processing: ${item.requestId}`);

                try {
                    const response = await this.orchestrator.handleMessage(item.message);

                    this.outgoingQueue.enqueue({
                        requestId: item.requestId,
                        response,
                        timestamp: Date.now()
                    }, 0);

                } catch (error: any) {
                    logger.error(`[Router] ✗ Orchestrator error: ${item.requestId}`, error.message);

                    this.outgoingQueue.enqueue({
                        requestId: item.requestId,
                        error: error.message || 'Unknown error',
                        timestamp: Date.now()
                    }, 0);
                }
            } catch (error) {
                logger.error('[Router] Error processing incoming queue:', error);
            }
        }
    }

    /**
     * Process outgoing queue
     */
    private async processOutgoingQueue() {
        while (true) {
            try {
                const item = await this.outgoingQueue.dequeue();

                this.logOutgoing(item.requestId, item);

                const resolver = this.pendingResponses.get(item.requestId);
                if (resolver) {
                    if (item.error) {
                        resolver(new Error(item.error));
                    } else if (item.response) {
                        resolver(item.response);
                    }
                    this.pendingResponses.delete(item.requestId);
                }

                logger.info(`[Router] ✓ Response delivered: ${item.requestId}`);

            } catch (error) {
                logger.error('[Router] Error processing outgoing queue:', error);
            }
        }
    }

    /**
     * Load persisted messages on startup
     */
    private async loadPersistedMessages() {
        const messages = await this.persistence.load();
        for (const msg of messages) {
            logger.info(`[Router] Restoring persisted message: ${msg.requestId}`);
            this.incomingQueue.enqueue(msg as IncomingQueueItem, 10); // High priority
        }
    }

    /**
     * Start metrics monitoring
     */
    private startMetricsMonitoring() {
        setInterval(() => {
            const anomalies = this.metrics.checkAnomalies();
            if (anomalies.length > 0) {
                logger.warn('[Router] ⚠️  Performance anomalies detected:', anomalies);
            }
        }, 60000); // Check every minute
    }

    /**
     * Wait for response with timeout
     */
    private waitForResponse(requestId: string): Promise<BotResponse> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingResponses.delete(requestId);
                logger.warn(`[Router] ⏱ Timeout: ${requestId}`);
                reject(new Error('Request timeout - no response after 30 seconds'));
            }, 30000);

            this.pendingResponses.set(requestId, (response) => {
                clearTimeout(timeout);
                if (response instanceof Error) {
                    reject(response);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Validate message
     */
    private validateMessage(message: UserMessage): boolean {
        if (!message.text || message.text.length === 0) return false;
        if (!message.userId) return false;
        if (message.text.length > 10000) return false;
        return true;
    }

    /**
     * Log incoming traffic
     */
    private logIncoming(requestId: string, message: UserMessage): void {
        const entry = {
            direction: 'IN' as const,
            timestamp: new Date().toISOString(),
            requestId,
            userId: message.userId,
            botId: message.botId || 'default',
            textLength: message.text.length,
            preview: message.text.substring(0, 50)
        };

        this.trafficLog.push(entry);
        logger.info('[Router IN]', entry);

        if (this.trafficLog.length > 1000) {
            this.trafficLog = this.trafficLog.slice(-1000);
        }
    }

    /**
     * Log outgoing traffic
     */
    private logOutgoing(requestId: string, item: OutgoingQueueItem): void {
        const entry = {
            direction: 'OUT' as const,
            timestamp: new Date().toISOString(),
            requestId,
            hasResponse: !!item.response,
            hasError: !!item.error,
            responseLength: item.response?.text.length || 0
        };

        this.trafficLog.push(entry);
        logger.info('[Router OUT]', entry);

        if (this.trafficLog.length > 1000) {
            this.trafficLog = this.trafficLog.slice(-1000);
        }
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get comprehensive stats
     */
    getStats() {
        return {
            queues: {
                incomingSize: this.incomingQueue.size,
                outgoingSize: this.outgoingQueue.size,
                pendingResponses: this.pendingResponses.size
            },
            circuitBreaker: {
                state: this.circuitBreaker.getState()
            },
            connections: this.connectionManager.getStats(),
            metrics: this.metrics.getStats(),
            trafficLogSize: this.trafficLog.length
        };
    }

    /**
     * Get connection manager
     */
    getConnectionManager(): ConnectionManager {
        return this.connectionManager;
    }

    /**
     * Get traffic log
     */
    getTrafficLog(limit: number = 100): any[] {
        return this.trafficLog.slice(-limit);
    }

    /**
     * Manual circuit breaker reset
     */
    resetCircuitBreaker(): void {
        this.circuitBreaker.reset();
    }
}
