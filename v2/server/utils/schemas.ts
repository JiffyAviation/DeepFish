/**
 * Zod Schemas for Validation
 * Validates all JSON data structures
 */

import { z } from 'zod';

/**
 * Bot Definition Schema
 */
export const BotDefinitionSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    personality: z.object({
        traits: z.array(z.string()),
        speakingStyle: z.string(),
        catchphrases: z.array(z.string()),
        emotes: z.record(z.string())
    }),
    appearance: z.object({
        description: z.string(),
        colors: z.array(z.string()),
        avatar: z.string(),
        style: z.string()
    }),
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        mudText: z.object({
            examine: z.string(),
            use: z.string().optional()
        }),
        ui: z.object({
            component: z.string(),
            props: z.record(z.any()),
            style: z.record(z.any())
        }).optional()
    })),
    ai: z.object({
        model: z.string(),
        systemPrompt: z.string(),
        temperature: z.number().min(0).max(2),
        maxTokens: z.number().positive()
    }),
    location: z.object({
        defaultRoom: z.string(),
        canMove: z.boolean()
    })
});

/**
 * User Entitlements Schema
 */
export const UserEntitlementsSchema = z.object({
    userId: z.string().min(1),
    email: z.string().email(),
    tier: z.enum(['free', 'pro', 'enterprise']),
    createdAt: z.date(),
    lastModified: z.date(),
    features: z.object({
        bots: z.record(z.boolean()),
        rooms: z.record(z.boolean()),
        items: z.record(z.boolean()),
        capabilities: z.object({
            voiceCalls: z.boolean(),
            vrAccess: z.boolean(),
            apiAccess: z.boolean(),
            customBots: z.boolean()
        })
    })
});

/**
 * Room Schema
 */
export const RoomSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string(),
    mudText: z.object({
        examine: z.string(),
        enter: z.string().optional()
    }),
    exits: z.array(z.string()).optional()
});

/**
 * Event Schema
 */
export const EventSchema = z.object({
    type: z.string().min(1),
    source: z.string().min(1),
    target: z.string().optional(),
    data: z.any()
});

/**
 * Validate and parse data with schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Safe validation (returns null on error)
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}
