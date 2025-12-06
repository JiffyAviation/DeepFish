/**
 * ID Generation Utilities
 * v3.0.0 - Prevents ID collision bugs
 */

/**
 * Generates a unique ID using timestamp + random string
 * Format: {timestamp}-{random9chars}
 * Example: "1733515438123-k2j9x4m1p"
 */
export const generateId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${timestamp}-${random}`;
};

/**
 * Generates a cryptographically secure UUID (if available)
 * Falls back to generateId() if crypto.randomUUID is not supported
 */
export const generateSecureId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return generateId();
};
