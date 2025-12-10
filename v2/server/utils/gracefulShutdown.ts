/**
 * Graceful Shutdown Handler
 * Ensures clean exit by finishing current work before shutdown
 */

import { logger } from './logger.js';

type ShutdownHandler = () => Promise<void>;

export class GracefulShutdown {
    private handlers: ShutdownHandler[] = [];
    private isShuttingDown = false;

    constructor() {
        // Listen for shutdown signals
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            logger.error('[Shutdown] Uncaught exception:', error);
            this.shutdown('UNCAUGHT_EXCEPTION');
        });
    }

    /**
     * Register shutdown handler
     */
    onShutdown(handler: ShutdownHandler): void {
        this.handlers.push(handler);
    }

    /**
     * Check if shutting down
     */
    isShuttingDownNow(): boolean {
        return this.isShuttingDown;
    }

    /**
     * Perform graceful shutdown
     */
    private async shutdown(signal: string): Promise<void> {
        if (this.isShuttingDown) {
            logger.warn('[Shutdown] Already shutting down, forcing exit...');
            process.exit(1);
        }

        this.isShuttingDown = true;
        logger.info(`[Shutdown] Received ${signal} - starting graceful shutdown`);

        try {
            // Run all shutdown handlers
            for (const handler of this.handlers) {
                await handler();
            }

            logger.info('[Shutdown] Graceful shutdown complete');
            process.exit(0);
        } catch (error) {
            logger.error('[Shutdown] Error during shutdown:', error);
            process.exit(1);
        }
    }
}

export const gracefulShutdown = new GracefulShutdown();
