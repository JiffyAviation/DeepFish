/**
 * Rate Limiter
 * Prevents abuse and overload
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

export class RateLimiter {
    private limits = new Map<string, RateLimitEntry>();
    private maxPerMinute: number;

    constructor(maxPerMinute: number = 60) {
        this.maxPerMinute = maxPerMinute;

        // Cleanup old entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Check if request is allowed
     */
    allow(userId: string): boolean {
        const now = Date.now();
        const entry = this.limits.get(userId);

        if (!entry || now > entry.resetTime) {
            // New window
            this.limits.set(userId, {
                count: 1,
                resetTime: now + 60000 // 1 minute from now
            });
            return true;
        }

        if (entry.count >= this.maxPerMinute) {
            return false; // Rate limit exceeded
        }

        entry.count++;
        return true;
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [userId, entry] of this.limits.entries()) {
            if (now > entry.resetTime) {
                this.limits.delete(userId);
            }
        }
    }
}
