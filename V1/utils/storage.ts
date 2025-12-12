/**
 * Enhanced Safe Storage with validation and auto-repair
 */

interface StorageItem<T> {
    version: number;
    data: T;
    timestamp: number;
}

const STORAGE_VERSION = 1;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

class SafeStorage {
    private isAvailable: boolean;

    constructor() {
        this.isAvailable = this.checkAvailability();
    }

    private checkAvailability(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    /**
     * Get item with validation and auto-repair
     */
    getItem(key: string): string | null {
        if (!this.isAvailable) return null;

        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            // Try to parse as versioned data
            try {
                const parsed: StorageItem<string> = JSON.parse(raw);

                // Validate structure
                if (typeof parsed !== 'object' || !parsed.data) {
                    throw new Error('Invalid structure');
                }

                // Check version
                if (parsed.version !== STORAGE_VERSION) {
                    console.warn(`Storage version mismatch for ${key}, clearing`);
                    this.removeItem(key);
                    return null;
                }

                // Check age
                const age = Date.now() - (parsed.timestamp || 0);
                if (age > MAX_AGE_MS) {
                    console.warn(`Storage item ${key} expired, clearing`);
                    this.removeItem(key);
                    return null;
                }

                return parsed.data;
            } catch {
                // Not versioned, return raw value (backward compatibility)
                return raw;
            }
        } catch (error) {
            console.error(`Error reading ${key} from storage:`, error);
            this.removeItem(key); // Clear corrupted data
            return null;
        }
    }

    /**
     * Set item with versioning and timestamp
     */
    setItem(key: string, value: string): boolean {
        if (!this.isAvailable) return false;

        try {
            const item: StorageItem<string> = {
                version: STORAGE_VERSION,
                data: value,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error: any) {
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded, clearing old items');
                this.clearOldItems();
                try {
                    const item: StorageItem<string> = {
                        version: STORAGE_VERSION,
                        data: value,
                        timestamp: Date.now()
                    };
                    localStorage.setItem(key, JSON.stringify(item));
                    return true;
                } catch {
                    console.error('Still failed after clearing old items');
                    return false;
                }
            }
            console.error(`Error writing ${key} to storage:`, error);
            return false;
        }
    }

    /**
     * Remove item
     */
    removeItem(key: string): void {
        if (!this.isAvailable) return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
        }
    }

    /**
     * Clear old items to free up space
     */
    private clearOldItems(): void {
        if (!this.isAvailable) return;

        const keys = Object.keys(localStorage);
        const items: Array<{ key: string; timestamp: number }> = [];

        for (const key of keys) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) continue;

                const parsed: StorageItem<any> = JSON.parse(raw);
                if (parsed.timestamp) {
                    items.push({ key, timestamp: parsed.timestamp });
                }
            } catch {
                // Skip invalid items
            }
        }

        // Sort by age (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 25%
        const toRemove = Math.ceil(items.length * 0.25);
        for (let i = 0; i < toRemove; i++) {
            this.removeItem(items[i].key);
        }

        console.log(`Cleared ${toRemove} old storage items`);
    }

    /**
     * Clear all items
     */
    clear(): void {
        if (!this.isAvailable) return;
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    /**
     * Check if storage is available
     */
    isStorageAvailable(): boolean {
        return this.isAvailable;
    }
}

export const safeLocalStorage = new SafeStorage();
