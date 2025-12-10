/**
 * Environment Configuration with Validation
 * Validates API keys on startup
 */

import { z } from 'zod';

const EnvSchema = z.object({
    // AI Provider Keys (at least one required)
    GEMINI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),

    // Optional
    ELEVENLABS_API_KEY: z.string().optional(),

    // Server
    PORT: z.coerce.number().default(3001),
    NODE_ENV: z.enum(['development', 'production']).default('development')
}).refine(
    (data) => data.GEMINI_API_KEY || data.ANTHROPIC_API_KEY,
    { message: 'At least one AI provider API key is required (GEMINI_API_KEY or ANTHROPIC_API_KEY)' }
);

export type Config = z.infer<typeof EnvSchema>;

/**
 * Validate and export config
 */
export function validateConfig(): Config {
    try {
        return EnvSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Configuration Error:');
            error.errors.forEach(err => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
}

export const config = validateConfig();
