/**
 * Metrics Collector
 * Tracks router performance and health
 */

import { logger } from './logger.js';

interface Metric {
    timestamp: number;
    value: number;
}

export class MetricsCollector {
    private responseTimes: Metric[] = [];
    private requestCounts: Metric[] = [];
    private errorCounts: Metric[] = [];
    private queueDepths: Metric[] = [];

    private readonly maxMetrics = 1000; // Keep last 1000 data points

    /**
     * Record response time
     */
    recordResponseTime(ms: number): void {
        this.responseTimes.push({ timestamp: Date.now(), value: ms });
        this.trim(this.responseTimes);
    }

    /**
     * Record request
     */
    recordRequest(): void {
        this.requestCounts.push({ timestamp: Date.now(), value: 1 });
        this.trim(this.requestCounts);
    }

    /**
     * Record error
     */
    recordError(): void {
        this.errorCounts.push({ timestamp: Date.now(), value: 1 });
        this.trim(this.errorCounts);
    }

    /**
     * Record queue depth
     */
    recordQueueDepth(depth: number): void {
        this.queueDepths.push({ timestamp: Date.now(), value: depth });
        this.trim(this.queueDepths);
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            averageResponseTime: this.average(this.responseTimes),
            requestsPerMinute: this.countLastMinute(this.requestCounts),
            errorsPerMinute: this.countLastMinute(this.errorCounts),
            averageQueueDepth: this.average(this.queueDepths),
            peakQueueDepth: this.max(this.queueDepths)
        };
    }

    /**
     * Check for anomalies
     */
    checkAnomalies(): string[] {
        const anomalies: string[] = [];
        const stats = this.getStats();

        if (stats.averageResponseTime > 5000) {
            anomalies.push(`High response time: ${stats.averageResponseTime}ms`);
        }

        if (stats.errorsPerMinute > 10) {
            anomalies.push(`High error rate: ${stats.errorsPerMinute}/min`);
        }

        if (stats.averageQueueDepth > 50) {
            anomalies.push(`High queue depth: ${stats.averageQueueDepth}`);
        }

        if (anomalies.length > 0) {
            logger.warn('[Metrics] Anomalies detected:', anomalies);
        }

        return anomalies;
    }

    /**
     * Helper: Calculate average
     */
    private average(metrics: Metric[]): number {
        if (metrics.length === 0) return 0;
        const sum = metrics.reduce((acc, m) => acc + m.value, 0);
        return Math.round(sum / metrics.length);
    }

    /**
     * Helper: Count in last minute
     */
    private countLastMinute(metrics: Metric[]): number {
        const oneMinuteAgo = Date.now() - 60000;
        return metrics.filter(m => m.timestamp > oneMinuteAgo).length;
    }

    /**
     * Helper: Find max
     */
    private max(metrics: Metric[]): number {
        if (metrics.length === 0) return 0;
        return Math.max(...metrics.map(m => m.value));
    }

    /**
     * Helper: Trim to max size
     */
    private trim(metrics: Metric[]): void {
        if (metrics.length > this.maxMetrics) {
            metrics.splice(0, metrics.length - this.maxMetrics);
        }
    }
}
