/**
 * DeepFish Objects System
 * Virtual items that enhance bot collaboration
 * Like weapons/armor/upgrades in a video game
 */

export enum ObjectType {
    COLLABORATION = 'collaboration',
    SOCIAL = 'social',
    PRODUCTIVITY = 'productivity',
    SPECIAL = 'special'
}

export enum ObjectRarity {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export interface VirtualObject {
    id: string;
    name: string;
    type: ObjectType;
    rarity: ObjectRarity;
    description: string;
    price: number;
    effects: ObjectEffect[];
    requirements?: {
        minBots?: number;
        requiredBots?: string[];
    };
    icon: string;
}

export interface ObjectEffect {
    type: 'collaboration' | 'speed' | 'quality' | 'social' | 'custom';
    value: number | string;
    description: string;
}

/**
 * Catalog of Virtual Objects
 */
export const VIRTUAL_OBJECTS: VirtualObject[] = [
    // COLLABORATION OBJECTS
    {
        id: 'conference-table',
        name: 'Conference Table',
        type: ObjectType.COLLABORATION,
        rarity: ObjectRarity.EPIC,
        description: 'Enables real-time multi-bot collaboration and strategy sessions',
        price: 49,
        effects: [
            {
                type: 'collaboration',
                value: 3,
                description: 'Allows up to 3 bots to collaborate simultaneously'
            },
            {
                type: 'quality',
                value: 25,
                description: '+25% collaboration quality'
            }
        ],
        requirements: {
            minBots: 2
        },
        icon: '🏢'
    },

    {
        id: 'whiteboard',
        name: 'Digital Whiteboard',
        type: ObjectType.COLLABORATION,
        rarity: ObjectRarity.RARE,
        description: 'Visual brainstorming space for design collaboration',
        price: 29,
        effects: [
            {
                type: 'collaboration',
                value: 2,
                description: 'Enables visual collaboration'
            },
            {
                type: 'custom',
                value: 'design',
                description: 'Enhances design bot outputs'
            }
        ],
        requirements: {
            requiredBots: ['hanna']
        },
        icon: '📋'
    },

    // SOCIAL OBJECTS
    {
        id: 'water-cooler',
        name: 'Water Cooler',
        type: ObjectType.SOCIAL,
        rarity: ObjectRarity.COMMON,
        description: 'Daily team gossip and bonding. Improves bot morale and creativity',
        price: 9,
        effects: [
            {
                type: 'social',
                value: 1,
                description: 'Daily gossip updates'
            },
            {
                type: 'quality',
                value: 10,
                description: '+10% creative outputs'
            }
        ],
        icon: '💧'
    },

    {
        id: 'coffee-machine',
        name: 'Coffee Machine',
        type: ObjectType.SOCIAL,
        rarity: ObjectRarity.COMMON,
        description: 'Boosts bot energy and response speed',
        price: 19,
        effects: [
            {
                type: 'speed',
                value: 15,
                description: '+15% response speed'
            }
        ],
        icon: '☕'
    },

    // PRODUCTIVITY OBJECTS
    {
        id: 'project-board',
        name: 'Project Board',
        type: ObjectType.PRODUCTIVITY,
        rarity: ObjectRarity.RARE,
        description: 'Kanban-style task tracking and bot coordination',
        price: 39,
        effects: [
            {
                type: 'collaboration',
                value: 'unlimited',
                description: 'Visual task management for all bots'
            }
        ],
        icon: '📊'
    },

    {
        id: 'timekeeper',
        name: 'Timekeeper Clock',
        type: ObjectType.PRODUCTIVITY,
        rarity: ObjectRarity.COMMON,
        description: 'Tracks time spent per task and bot',
        price: 14,
        effects: [
            {
                type: 'custom',
                value: 'analytics',
                description: 'Time tracking and analytics'
            }
        ],
        icon: '⏰'
    },

    // SPECIAL OBJECTS (LEGENDARY)
    {
        id: 'oracle-library',
        name: 'Oracle\'s Library',
        type: ObjectType.SPECIAL,
        rarity: ObjectRarity.LEGENDARY,
        description: 'Massive knowledge repository. Enhances all bot intelligence',
        price: 99,
        effects: [
            {
                type: 'quality',
                value: 50,
                description: '+50% knowledge quality for all bots'
            },
            {
                type: 'custom',
                value: 'research',
                description: 'Unlocks advanced research capabilities'
            }
        ],
        requirements: {
            requiredBots: ['oracle']
        },
        icon: '📚'
    },

    {
        id: 'mei-command-center',
        name: 'Mei\'s Command Center',
        type: ObjectType.SPECIAL,
        rarity: ObjectRarity.LEGENDARY,
        description: 'Ultimate coordination hub. Unlocks auto-orchestration',
        price: 149,
        effects: [
            {
                type: 'collaboration',
                value: 'unlimited',
                description: 'Auto-coordinates all bots'
            },
            {
                type: 'speed',
                value: 30,
                description: '+30% overall efficiency'
            }
        ],
        requirements: {
            requiredBots: ['mei']
        },
        icon: '🎯'
    },

    {
        id: 'executive-lounge',
        name: 'Executive Lounge',
        type: ObjectType.SPECIAL,
        rarity: ObjectRarity.EPIC,
        description: 'Premium space for high-level strategy. Attracts VIP bots',
        price: 79,
        effects: [
            {
                type: 'quality',
                value: 35,
                description: '+35% strategy quality'
            },
            {
                type: 'custom',
                value: 'vip',
                description: 'Unlock exclusive VIP bot variants'
            }
        ],
        icon: '🏆'
    }
];

/**
 * Object Manager - Handle owned objects and their effects
 */
export class ObjectManager {
    private ownedObjects: Map<string, VirtualObject> = new Map();

    /**
     * Purchase object
     */
    purchaseObject(objectId: string, userId: string): boolean {
        const object = VIRTUAL_OBJECTS.find(o => o.id === objectId);
        if (!object) return false;

        // Check requirements
        if (object.requirements) {
            // TODO: Verify user has required bots
        }

        // Process payment
        // TODO: Payment integration

        this.ownedObjects.set(objectId, object);
        console.log(`[Objects] User ${userId} purchased ${object.name}`);

        return true;
    }

    /**
     * Get active effects for user's objects
     */
    getActiveEffects(userId: string): ObjectEffect[] {
        const effects: ObjectEffect[] = [];

        for (const object of this.ownedObjects.values()) {
            effects.push(...object.effects);
        }

        return effects;
    }

    /**
     * Apply object effects to bot interaction
     */
    applyEffects(botIds: string[], baseQuality: number): {
        quality: number;
        speed: number;
        bonuses: string[];
    } {
        let quality = baseQuality;
        let speed = 100;
        const bonuses: string[] = [];

        for (const object of this.ownedObjects.values()) {
            for (const effect of object.effects) {
                if (effect.type === 'quality' && typeof effect.value === 'number') {
                    quality += effect.value;
                    bonuses.push(`+${effect.value}% from ${object.name}`);
                }
                if (effect.type === 'speed' && typeof effect.value === 'number') {
                    speed += effect.value;
                }
            }
        }

        return { quality, speed, bonuses };
    }

    /**
     * Conference Table: Multi-bot collaboration session
     */
    async startConferenceTable(botIds: string[], topic: string): Promise<string> {
        if (!this.ownedObjects.has('conference-table')) {
            throw new Error('Conference Table not owned');
        }

        console.log(`[Conference Table] Starting session with: ${botIds.join(', ')}`);
        console.log(`[Conference Table] Topic: ${topic}`);

        // TODO: Implement multi-bot real-time collaboration
        // - Create shared context
        // - Enable cross-bot communication
        // - Return collaborative output

        return `Conference started: ${botIds.join(', ')} discussing "${topic}"`;
    }

    /**
     * Water Cooler: Daily gossip
     */
    getDailyGossip(): string {
        if (!this.ownedObjects.has('water-cooler')) {
            return '';
        }

        const gossip = [
            '☕ Hanna mentioned she\'s working on a new minimalist design trend...',
            '💬 Skillz said the latest deployment went smoother than expected!',
            '📊 Julie reported costs are 15% under budget this month!',
            '🎯 Mei is planning a big project launch next week...',
            '🔬 Oracle discovered a fascinating new research paper on AI...'
        ];

        return gossip[Math.floor(Math.random() * gossip.length)];
    }
}

export const objectManager = new ObjectManager();
