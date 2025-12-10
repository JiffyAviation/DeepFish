/**
 * Per-User Feature Flags
 * Enable features for specific users (beta testers, influencers, VIPs)
 */

import { featureFlags, FeatureFlags } from './featureFlags.js';

/**
 * User-specific feature overrides
 * Stored in user's entitlement file
 */
export interface UserFeatureFlags {
    userId: string;
    betaFeatures?: Partial<FeatureFlags>;
    vipAccess?: boolean;
    influencer?: boolean;
}

/**
 * Check if user has access to a feature
 * Checks: Global flags → User overrides → Entitlements
 */
export async function userHasFeature(
    userId: string,
    feature: keyof FeatureFlags
): Promise<boolean> {
    // 1. Check global feature flag
    const globalEnabled = featureFlags[feature];

    // 2. Check user-specific overrides
    const userOverrides = await getUserFeatureOverrides(userId);
    if (userOverrides && userOverrides[feature] !== undefined) {
        return userOverrides[feature] as boolean;
    }

    // 3. Fall back to global flag
    return globalEnabled;
}

/**
 * Get user's feature overrides from entitlements
 */
async function getUserFeatureOverrides(userId: string): Promise<Partial<FeatureFlags> | null> {
    try {
        // Load from entitlements file
        const entitlements = await import(`../../data/entitlements/users/${userId}.json`);
        return entitlements.betaFeatures || null;
    } catch {
        return null;
    }
}

/**
 * Grant beta access to specific user
 */
export async function grantBetaFeature(
    userId: string,
    feature: keyof FeatureFlags
): Promise<void> {
    // Update user's entitlement file
    // Add feature to betaFeatures object
    console.log(`[FeatureFlags] Granted ${feature} to user ${userId}`);
}

/**
 * Feature flag middleware with user context
 */
export function requireUserFeature(feature: keyof FeatureFlags) {
    return async (req: any, res: any, next: any) => {
        const userId = req.user?.id || req.session?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const hasAccess = await userHasFeature(userId, feature);

        if (!hasAccess) {
            return res.status(403).json({
                error: 'Feature not available',
                feature,
                message: 'This feature is not enabled for your account yet.'
            });
        }

        next();
    };
}
