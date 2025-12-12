/**
 * Creativity Settings Calculator
 * Converts creativity slider (1-10) to temperature and constitution refresh rate
 */

export interface CreativitySettings {
    temperature: number;
    constitutionRefreshMs: number;
    description: string;
}

/**
 * Calculate settings based on creativity level (1-10)
 */
export function getCreativitySettings(creativity: number): CreativitySettings {
    // Clamp to 1-10
    const level = Math.max(1, Math.min(10, creativity));

    // Temperature: 0.1 (strict) to 1.6 (wild)
    const temperature = 0.1 + ((level - 1) * 0.15);

    // Constitution refresh intervals
    const refreshIntervals: Record<number, number> = {
        1: Infinity,        // Never refresh - locked in rules
        2: 30 * 60 * 1000,  // 30 minutes
        3: 15 * 60 * 1000,  // 15 minutes
        4: 10 * 60 * 1000,  // 10 minutes
        5: 5 * 60 * 1000,   // 5 minutes (default)
        6: 3 * 60 * 1000,   // 3 minutes
        7: 1 * 60 * 1000,   // 1 minute
        8: 30 * 1000,       // 30 seconds
        9: 10 * 1000,       // 10 seconds
        10: 0               // Every command - maximum freedom reminder
    };

    const descriptions: Record<number, string> = {
        1: 'Strict & Precise - Rules locked, deterministic',
        2: 'Very Controlled - Minimal variation',
        3: 'Controlled - Proven patterns only',
        4: 'Slightly Flexible - Some variation allowed',
        5: 'Balanced - Good mix of rules and creativity',
        6: 'Moderately Creative - More freedom',
        7: 'Creative - Significant improvisation',
        8: 'Very Creative - High freedom',
        9: 'Highly Creative - Maximum improvisation',
        10: 'Wild & Experimental - Total creative freedom'
    };

    return {
        temperature: parseFloat(temperature.toFixed(2)),
        constitutionRefreshMs: refreshIntervals[level],
        description: descriptions[level]
    };
}

/**
 * Get recommended creativity levels by role
 */
export const RECOMMENDED_CREATIVITY = {
    // Critical/Financial - Low creativity
    cfo: 2,
    billing: 2,
    security: 1,

    // Operational - Balanced
    project_manager: 5,
    orchestrator: 5,

    // Technical - Controlled
    architect: 3,
    engineer: 4,

    // Creative - High creativity
    designer: 8,
    creative_director: 9,
    brainstormer: 10,

    // Customer-facing - Moderate
    hospitality: 6,
    support: 5
};

/**
 * Example usage:
 * 
 * const settings = getCreativitySettings(8);
 * // {
 * //   temperature: 1.15,
 * //   constitutionRefreshMs: 30000,
 * //   description: 'Very Creative - High freedom'
 * // }
 */
