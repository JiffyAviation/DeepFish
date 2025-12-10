/**
 * Circuit Breaker
 * Prevents cascade failures by temporarily stopping requests to failing backend
 */

import { logger } from './logger.js';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
    private state: CircuitState = 'CLOSED';
    private failureCount = 0;
    private successCount = 0;
    private lastFailureTime = 0;

    private readonly failureThreshold = 5;
    private readonly successThreshold = 2;
    private readonly timeout = 30000; // 30 seconds

    /**
     * Check if request should be allowed
     */
    allowRequest(): boolean {
        if (this.state === 'CLOSED') {
            return true;
        }

        if (this.state === 'OPEN') {
            // Check if timeout has passed
            if (Date.now() - this.lastFailureTime > this.timeout) {
                logger.info('[CircuitBreaker] Entering HALF_OPEN state - testing recovery');
                this.state = 'HALF_OPEN';
                this.successCount = 0;
                return true;
            }
            return false;
        }

        // HALF_OPEN - allow limited requests
        return true;
    }

    /**
     * Record successful request
     */
    recordSuccess(): void {
        this.failureCount = 0;

        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                logger.info('[CircuitBreaker] Recovery successful - CLOSED');
                this.state = 'CLOSED';
                this.successCount = 0;
            }
        }
    }

    /**
     * Record failed request
     */
    recordFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === 'HALF_OPEN') {
            logger.warn('[CircuitBreaker] Recovery failed - OPEN');
            this.state = 'OPEN';
            this.failureCount = 0;
            return;
        }

        if (this.failureCount >= this.failureThreshold) {
            logger.error(`[CircuitBreaker] Threshold exceeded (${this.failureCount} failures) - OPEN`);
            this.state = 'OPEN';
        }
    }

    /**
     * Get current state
     */
    getState(): CircuitState {
        return this.state;
    }

    /**
     * Force reset
     */
    reset(): void {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        logger.info('[CircuitBreaker] Manually reset to CLOSED');
    }
}
