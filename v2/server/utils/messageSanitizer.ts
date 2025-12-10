/**
 * Message Sanitizer
 * Cleans and validates messages to prevent injection attacks
 */

import { logger } from './logger.js';

export class MessageSanitizer {
    // Dangerous patterns to detect
    private dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // onclick=, onerror=, etc.
        /<iframe[^>]*>/gi,
        /eval\(/gi,
        /document\.cookie/gi
    ];

    // Spam patterns
    private spamPatterns = [
        /(.)\1{20,}/g, // Same character repeated 20+ times
        /https?:\/\/[^\s]{100,}/g, // Very long URLs
    ];

    /**
     * Sanitize message text
     */
    sanitize(text: string): string {
        let sanitized = text;

        // Remove dangerous patterns
        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(sanitized)) {
                logger.warn('[Sanitizer] Blocked dangerous pattern:', pattern);
                sanitized = sanitized.replace(pattern, '[BLOCKED]');
            }
        }

        // Normalize whitespace
        sanitized = sanitized.replace(/\s+/g, ' ').trim();

        return sanitized;
    }

    /**
     * Check if message looks like spam
     */
    isSpam(text: string): boolean {
        for (const pattern of this.spamPatterns) {
            if (pattern.test(text)) {
                logger.warn('[Sanitizer] Detected spam pattern');
                return true;
            }
        }
        return false;
    }

    /**
     * Validate message is safe
     */
    validate(text: string): { valid: boolean; reason?: string } {
        // Check for spam
        if (this.isSpam(text)) {
            return { valid: false, reason: 'Message appears to be spam' };
        }

        // Check for dangerous content
        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(text)) {
                return { valid: false, reason: 'Message contains dangerous content' };
            }
        }

        return { valid: true };
    }
}
