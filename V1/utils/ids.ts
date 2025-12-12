/**
 * ID Generation Utilities
 * v3.1.0 - Standardized to crypto.randomUUID
 */

/**
 * Generates a cryptographically secure UUID
 * Falls back to timestamp-based ID if crypto.randomUUID is not supported
 * Format (primary): "550e8400-e29b-41d4-a716-446655440000"
 * Format (fallback): "1733515438123-k2j9x4m1p"
 */
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${timestamp}-${random}`;
};

/**
 * Alias for generateId (for backward compatibility)
 * @deprecated Use generateId() instead
 */
export const generateSecureId = generateId;
