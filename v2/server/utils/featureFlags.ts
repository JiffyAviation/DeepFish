/**
 * Global Feature Flags
 * Control which features are enabled/disabled via Railway env vars
 */

import { z } from 'zod';

const FeatureFlagsSchema = z.object({
    // Core features (always on)
    CORE_CHAT: z.boolean().default(true),
    CORE_BOTS: z.boolean().default(true),
    CORE_ROOMS: z.boolean().default(true),

    // Launch features (v1.0)
    FEATURE_CLI: z.boolean().default(true),
    FEATURE_REACT_UI: z.boolean().default(true),
    FEATURE_VOICE_CALLS: z.boolean().default(false),
    FEATURE_VR: z.boolean().default(false),

    // Secret weapon (v2.0)
    FEATURE_SMS: z.boolean().default(false), // ← OFF until v2 launch!

    // Future features
    FEATURE_CUSTOM_BOTS: z.boolean().default(false),
    FEATURE_API_ACCESS: z.boolean().default(false),
    FEATURE_YOUTUBE_TRANSLATOR: z.boolean().default(false),
    FEATURE_NATIVE_CLI_APPS: z.boolean().default(false),

    // Monetization
    FEATURE_STRIPE_PAYMENTS: z.boolean().default(true),
    FEATURE_ENTITLEMENTS: z.boolean().default(true),

    // Admin/Debug
    FEATURE_ADMIN_DASHBOARD: z.boolean().default(false),
    FEATURE_METRICS: z.boolean().default(true),
    FEATURE_DEBUG_MODE: z.boolean().default(false)
});

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

/**
 * Load feature flags from environment
 */
export function loadFeatureFlags(): FeatureFlags {
    const flags = {
        // Core (always on)
        CORE_CHAT: true,
        CORE_BOTS: true,
        CORE_ROOMS: true,

        // Launch features
        FEATURE_CLI: process.env.FEATURE_CLI === 'true',
        FEATURE_REACT_UI: process.env.FEATURE_REACT_UI === 'true',
        FEATURE_VOICE_CALLS: process.env.FEATURE_VOICE_CALLS === 'true',
        FEATURE_VR: process.env.FEATURE_VR === 'true',

        // Secret weapon (OFF by default)
        FEATURE_SMS: process.env.FEATURE_SMS === 'true',

        // Future features
        FEATURE_CUSTOM_BOTS: process.env.FEATURE_CUSTOM_BOTS === 'true',
        FEATURE_API_ACCESS: process.env.FEATURE_API_ACCESS === 'true',
        FEATURE_YOUTUBE_TRANSLATOR: process.env.FEATURE_YOUTUBE_TRANSLATOR === 'true',
        FEATURE_NATIVE_CLI_APPS: process.env.FEATURE_NATIVE_CLI_APPS === 'true',

        // Monetization
        FEATURE_STRIPE_PAYMENTS: process.env.FEATURE_STRIPE_PAYMENTS !== 'false',
        FEATURE_ENTITLEMENTS: process.env.FEATURE_ENTITLEMENTS !== 'false',

        // Admin/Debug
        FEATURE_ADMIN_DASHBOARD: process.env.FEATURE_ADMIN_DASHBOARD === 'true',
        FEATURE_METRICS: process.env.FEATURE_METRICS !== 'false',
        FEATURE_DEBUG_MODE: process.env.FEATURE_DEBUG_MODE === 'true'
    };

    return FeatureFlagsSchema.parse(flags);
}

// Global feature flags instance
export const featureFlags = loadFeatureFlags();

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return featureFlags[feature];
}

/**
 * Get enabled features list
 */
export function getEnabledFeatures(): string[] {
    return Object.entries(featureFlags)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature);
}

/**
 * Feature flag middleware for Express
 */
export function requireFeature(feature: keyof FeatureFlags) {
    return (req: any, res: any, next: any) => {
        if (!isFeatureEnabled(feature)) {
            return res.status(403).json({
                error: 'Feature not available',
                feature,
                message: 'This feature is not enabled yet. Stay tuned!'
            });
        }
        next();
    };
}
