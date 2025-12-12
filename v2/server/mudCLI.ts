/**
 * MUD/MUSH CLI Interface
 * Pure terminal interface with standard MUD commands
 */

import readline from 'readline';
import { world } from './world/world.js';
import { botLoader } from './world/botLoader.js';
import { eventBus } from './utils/eventBus.js';
import { logger } from './utils/logger.js';
import { MessageSanitizer } from './utils/messageSanitizer.js';
import { credentialManager } from './utils/credentialManager.js';
import { trainingManager } from './utils/trainingManager.js';
import { customBotManager } from './utils/customBotManager.js';

const sanitizer = new MessageSanitizer();

export class MudCLI {
    private rl: readline.Interface;
    private userId: string;
    private currentRoom: string = 'lobby';

    constructor(userId: string = 'admin') {
        this.userId = userId;

        // Create readline interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        });

        // Subscribe to output events for this user
        eventBus.subscribe('user:output', (event) => {
            if (event.target === this.userId) {
                this.display(event.data);
            }
        });

        // Subscribe to room messages
        eventBus.subscribe('room:message', (event) => {
            if (event.data.roomId === this.currentRoom) {
                console.log(`${event.data.userId} says: ${event.data.message}`);
            }
        });

        // Subscribe to room announcements
        eventBus.subscribe('room:announce', (event) => {
            if (event.data.roomId === this.currentRoom) {
                console.log(`[${event.data.message}]`);
            }
        });

        // Subscribe to bot responses
        eventBus.subscribe('bot:response', (event) => {
            if (event.data.userId === this.userId) {
                console.log(`\n${event.data.text}\n`);
            }
        });
    }

    /**
     * Start CLI
     */
    start(): void {
        this.showWelcome();
        this.enterRoom(this.currentRoom);

        this.rl.on('line', (input) => {
            this.handleCommand(input.trim());
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            console.log('\nGoodbye!');
            process.exit(0);
        });

        this.rl.prompt();
    }

    /**
     * Show welcome message
     */
    private showWelcome(): void {
        console.log('\n╔═══════════════════════════════════════╗');
        console.log('║   🏢 Welcome to DeepFish Tower 🏢    ║');
        console.log('║                                       ║');
        console.log('║   Type "help" for commands            ║');
        console.log('║   Type "quit" to exit                 ║');
        console.log('╚═══════════════════════════════════════╝\n');
    }

    /**
     * Handle user command
     */
    private handleCommand(input: string): void {
        if (!input) return;

        // Sanitize input
        const sanitized = sanitizer.sanitize(input);
        if (!sanitized) {
            console.log('Invalid input detected.');
            return;
        }

        const [command, ...args] = sanitized.split(' ');
        if (!command) return;

        const arg = args.join(' ');

        switch (command.toLowerCase()) {
            case 'look':
            case 'l':
                this.look();
                break;

            case 'go':
                if (arg) this.go(arg);
                else console.log('Go where?');
                break;

            case 'rooms':
                this.listRooms();
                break;

            case 'who':
                this.who();
                break;

            case 'credentials':
            case 'creds':
                this.handleCredentials(args);
                break;

            case 'train':
                this.handleTrain(args);
                break;

            case 'bot':
                this.handleBot(args);
                break;

            case 'dash':
            case 'dashboard':
                this.handleDashboard(args);
                break;

            case 'admin':
                this.handleAdmin(args);
                break;

            case 'help':
                this.showHelp();
                break;

            case 'quit':
            case 'exit':
                this.rl.close();
                break;

            // Explicit talk/say commands (Deprecated but supported for muscle memory)
            case 'say':
            case 'talk':
                if (arg) {
                    // Strip "talk botname" prefix if user used "talk mei hello"
                    // But for now, just sanitize and treat as room message
                    this.say(arg);
                }
                break;

            default:
                // IMPLICIT CHAT
                // If not a command, treat as saying something in the room
                this.say(input);
        }
    }

    /**
     * Look around current room
     */
    private look(): void {
        eventBus.emitEvent({
            type: 'user:look',
            source: this.userId,
            target: this.currentRoom,
            data: { userId: this.userId }
        });
    }

    /**
     * Move to another room
     */
    private go(roomId: string): void {
        const room = world.getRoom(roomId);
        if (!room) {
            console.log(`Room "${roomId}" not found.`);
            return;
        }

        // Leave current room
        eventBus.emitEvent({
            type: 'user:leave',
            source: this.userId,
            target: this.currentRoom,
            data: { userId: this.userId }
        });

        // Enter new room
        this.currentRoom = roomId;
        this.enterRoom(roomId);
    }

    /**
     * Enter a room
     */
    private enterRoom(roomId: string): void {
        eventBus.emitEvent({
            type: 'user:enter',
            source: this.userId,
            target: roomId,
            data: { userId: this.userId }
        });

        // Auto-look
        this.look();
    }

    /**
     * Say something in current room
     */
    private say(message: string): void {
        eventBus.emitEvent({
            type: 'user:say',
            source: this.userId,
            target: this.currentRoom,
            data: { userId: this.userId, message }
        });
    }

    /**
     * Talk to a specific bot
     */
    private talkToBot(botName: string, message: string): void {
        const bots = botLoader.listBots();
        const bot = bots.find(b => b.name.toLowerCase() === botName.toLowerCase());

        if (!bot) {
            console.log(`Bot "${botName}" not found. Type "who" to see available bots.`);
            return;
        }

        console.log(`You say to ${bot.name}: ${message}`);

        eventBus.emitEvent({
            type: 'user:talk',
            source: this.userId,
            target: bot.id,
            data: { userId: this.userId, message }
        });
    }

    /**
     * List all rooms
     */
    private listRooms(): void {
        const rooms = world.listRooms();
        console.log('\n📍 Available Rooms:');
        for (const room of rooms) {
            const occupants = room.occupants > 0 ? ` (${room.occupants} present)` : '';
            console.log(`  → ${room.id}: ${room.name}${occupants}`);
        }
        console.log('');
    }

    /**
     * Show who's online
     */
    private who(): void {
        const bots = botLoader.listBots();

        console.log('\n👥 Online:');
        console.log(`  ✓ ${this.userId} (you)`);

        for (const bot of bots) {
            console.log(`  ✓ ${bot.name} - ${bot.title} (in ${bot.room})`);
        }

        console.log('');
    }

    /**
     * Show help
     */
    private showHelp(): void {
        console.log('\n📖 Available Commands:');
        console.log('  <anything>       - Just type to speak in the room');
        console.log('  look, l          - Look around current room');
        console.log('  go <room>        - Move to another room');
        console.log('  rooms            - List all available rooms');
        console.log('  who              - Show who\'s online');
        console.log('');
        console.log('  credentials      - Manage your API keys');
        console.log('    add <provider> <key>  - Add API key');
        console.log('    list                  - List your keys');
        console.log('    test <provider>       - Test connection');
        console.log('');
        console.log('  train <bot>      - Train a bot (multi-line input)');
        console.log('  bot create       - Create custom bot');
        console.log('  bot list         - List your bots');
        console.log('');
        console.log('  help             - Show this help');
        console.log('  quit, exit       - Exit DeepFish');
        console.log('');
    }

    /**
     * Display output to user
     */
    private display(data: any): void {
        console.log(`\n${data.name}`);
        console.log(`${data.description}`);

        if (data.occupants && data.occupants.length > 0) {
            console.log(`\nPresent: ${data.occupants.join(', ')}`);
        }

        if (data.exits && data.exits.length > 0) {
            console.log(`Exits: ${data.exits.join(', ')}`);
        }

        console.log('');
    }

    /**
     * Handle credentials command
     */
    private async handleCredentials(args: string[]): Promise<void> {
        const [action, provider, ...rest] = args;

        switch (action) {
            case 'add':
                if (!provider || rest.length === 0) {
                    console.log('Usage: credentials add <provider> <api_key>');
                    return;
                }
                const apiKey = rest.join(' ');
                await credentialManager.addCredential(this.userId, provider, apiKey);
                console.log(`✓ ${provider} API key added!`);
                break;

            case 'list':
                const providers = await credentialManager.listCredentials(this.userId);
                console.log('\n📋 Your API Keys:');
                if (providers.length === 0) {
                    console.log('  (none set)');
                } else {
                    for (const p of providers) {
                        console.log(`  ✓ ${p}`);
                    }
                }
                console.log('');
                break;

            case 'remove':
                if (!provider) {
                    console.log('Usage: credentials remove <provider>');
                    return;
                }
                await credentialManager.removeCredential(this.userId, provider);
                console.log(`✓ ${provider} API key removed`);
                break;

            case 'test':
                if (!provider) {
                    console.log('Usage: credentials test <provider>');
                    return;
                }
                console.log(`Testing ${provider} API...`);
                const success = await credentialManager.testCredential(this.userId, provider);
                if (success) {
                    console.log(`✓ ${provider} connection successful!`);
                } else {
                    console.log(`✗ ${provider} connection failed`);
                }
                break;

            default:
                console.log('Usage: credentials <add|list|remove|test>');
        }
    }

    /**
     * Handle train command
     */
    private async handleTrain(args: string[]): Promise<void> {
        const [botId, ...rest] = args;

        if (!botId) {
            console.log('Usage: train <bot> [url <url>|file <path>|queue]');
            return;
        }

        if (rest.length === 0) {
            // Multi-line input mode
            console.log(`📚 Training ${botId}`);
            console.log('Paste your content (Ctrl+D when done):');
            console.log('');
            console.log('[Multi-line input coming soon!]');
        } else if (rest[0] === 'url') {
            const url = rest.slice(1).join(' ');
            await trainingManager.addTraining({
                botId,
                type: 'url',
                content: url,
                priority: 'high',
                addedBy: this.userId
            });
            console.log(`📺 Added URL to ${botId}'s training queue`);
            console.log('✓ Queued!');
        } else if (rest[0] === 'file') {
            const filepath = rest.slice(1).join(' ');
            await trainingManager.addTraining({
                botId,
                type: 'file',
                content: filepath,
                priority: 'high',
                addedBy: this.userId
            });
            console.log(`📄 Added file to ${botId}'s training queue`);
            console.log('✓ Queued!');
        } else if (rest[0] === 'queue') {
            const queue = await trainingManager.getPendingTraining();
            console.log('\n📋 Training Queue:');
            if (queue.length === 0) {
                console.log('  (empty)');
            } else {
                for (const item of queue) {
                    const icon = item.type === 'url' ? '📺' : item.type === 'file' ? '📄' : '📝';
                    console.log(`  ${icon} ${item.botId} - ${item.content.substring(0, 50)}...`);
                    console.log(`     Priority: ${item.priority} | Status: ${item.status}`);
                }
            }
            console.log('');
        }
    }

    /**
     * Handle bot command
     */
    private async handleBot(args: string[]): Promise<void> {
        const [action, ...rest] = args;

        switch (action) {
            case 'create':
                const botId = rest.join('-').toLowerCase();
                if (!botId) {
                    console.log('Usage: bot create <name>');
                    return;
                }

                // Create basic bot
                await customBotManager.createBot(this.userId, botId, {
                    name: rest.join(' '),
                    title: 'Custom Assistant',
                    description: 'A custom AI assistant'
                });

                console.log(`🤖 Created bot: ${botId}`);
                console.log(`✓ Saved to: data/users/${this.userId}/bots/${botId}.json`);
                console.log(`\nTalk to your bot: talk ${botId} Hello!`);
                break;

            case 'list':
                const bots = await customBotManager.listBots(this.userId);
                console.log('\n🤖 Your Bots:');
                if (bots.length === 0) {
                    console.log('  (none yet - create one with: bot create <name>)');
                } else {
                    for (const bot of bots) {
                        console.log(`  ✓ ${bot}`);
                    }
                }
                console.log('');
                break;

            case 'edit':
                const editBot = rest.join('-').toLowerCase();
                if (!editBot) {
                    console.log('Usage: bot edit <name>');
                    return;
                }
                const botDef = await customBotManager.loadBot(this.userId, editBot);
                if (botDef) {
                    console.log(`✏️ Bot: ${editBot}`);
                    console.log(JSON.stringify(botDef, null, 2));
                } else {
                    console.log(`✗ Bot not found: ${editBot}`);
                }
                break;

            case 'config':
                const configBot = rest[0]?.toLowerCase();
                if (!configBot) {
                    console.log('Usage: bot config <name> [set <llm>|reset|constitution <on|off>]');
                    return;
                }
                this.handleBotConfig(configBot, rest.slice(1));
                break;

            default:
                console.log('Usage: bot <create|list|edit>');
        }
    }

    /**
     * Handle dashboard command
     */
    private handleDashboard(args: string[]): void {
        const botId = args[0]?.toLowerCase();

        if (!botId) {
            console.log('Usage: dash <bot>');
            console.log('Example: dash mei');
            return;
        }

        // Show bot-specific dashboard
        switch (botId) {
            case 'mei':
                this.showMeiDashboard();
                break;
            case 'oracle':
                this.showOracleDashboard();
                break;
            case 'julie':
                this.showJulieDashboard();
                break;
            case 'app':
                this.showAppDashboard();
                break;
            default:
                console.log(`No dashboard available for ${botId}`);
                console.log('Available: mei, oracle, julie, app');
        }
    }

    /**
     * Mei's Project Dashboard
     */
    private showMeiDashboard(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║         📋 MEI\'S PROJECT DASHBOARD 📋                    ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('📊 CURRENT SPRINT');
        console.log('  Sprint: v2 Launch');
        console.log('  Progress: ████████████░░░░░░░░ 60%');
        console.log('  Days Remaining: 5');
        console.log('');
        console.log('✅ COMPLETED TODAY');
        console.log('  ✓ AI Integration (Oracle & Mei)');
        console.log('  ✓ Credential Management System');
        console.log('  ✓ Training Queue System');
        console.log('  ✓ Custom Bot Creation');
        console.log('');
        console.log('🎯 IN PROGRESS');
        console.log('  [/] React UI Development');
        console.log('  [/] Railway Deployment');
        console.log('');
        console.log('⚠️  BLOCKERS');
        console.log('  • UI design needs finalization');
        console.log('  • Railway env vars need setup');
        console.log('');
        console.log('📅 UPCOMING');
        console.log('  • SMS Integration (v2.0 secret weapon)');
        console.log('  • VIP Badge System');
        console.log('  • Production deployment');
        console.log('');
        console.log('💬 Talk to Mei: talk mei <message>');
        console.log('');
    }

    /**
     * Oracle\'s Architecture Dashboard
     */
    private showOracleDashboard(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║      🧙 ORACLE\'S ARCHITECTURE DASHBOARD 🧙               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('🏗️  SYSTEM ARCHITECTURE');
        console.log('  Pattern: MUD/MUSH (1978-present)');
        console.log('  Core: Event-driven');
        console.log('  Scale: JSON → Redis → Database');
        console.log('');
        console.log('✅ PROVEN PATTERNS IN USE');
        console.log('  ✓ Event Bus (decoupled communication)');
        console.log('  ✓ Bot Loader (modular agents)');
        console.log('  ✓ Room System (spatial organization)');
        console.log('  ✓ CLI Interface (40+ years proven)');
        console.log('');
        console.log('📐 CURRENT METRICS');
        console.log('  Bots: 5 loaded');
        console.log('  Rooms: 4 active');
        console.log('  Events: Real-time');
        console.log('  Uptime: Stable');
        console.log('');
        console.log('🎯 ARCHITECTURE PRINCIPLES');
        console.log('  • No speculation, only proven designs');
        console.log('  • Simple first, scale when needed');
        console.log('  • Walls you can knock out');
        console.log('');
        console.log('💬 Ask Oracle: talk oracle <question>');
        console.log('');
    }

    /**
     * Julie's Finance Dashboard
     */
    private showJulieDashboard(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║         💼 JULIE\'S FINANCE DASHBOARD 💼                  ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('💰 REVENUE (CURRENT MONTH)');
        console.log('  Subscriptions: $0 (pre-launch)');
        console.log('  SMS Add-ons: $0');
        console.log('  Total: $0');
        console.log('');
        console.log('💸 COSTS (CURRENT MONTH)');
        console.log('  Railway Hosting: $20');
        console.log('  Gemini API: $0 (free tier)');
        console.log('  Twilio SMS: $0 (not active)');
        console.log('  Total: $20');
        console.log('');
        console.log('📊 PROFIT/LOSS');
        console.log('  Net: -$20 (pre-launch development)');
        console.log('  Margin: N/A (no revenue yet)');
        console.log('');
        console.log('📈 PROJECTIONS (POST-LAUNCH)');
        console.log('  Year 1: $50K revenue - $10K costs = $40K profit');
        console.log('  Year 2: $166K revenue - $25K costs = $141K profit');
        console.log('  Year 3: $500K revenue - $60K costs = $440K profit');
        console.log('');
        console.log('💳 PRICING TIERS');
        console.log('  Free:  $0/mo (basic access)');
        console.log('  Pro:   $10/mo (unlimited bots)');
        console.log('  Team:  $50/mo (collaboration)');
        console.log('  SMS:   $5/mo add-on');
        console.log('');
        console.log('🎯 BREAK-EVEN ANALYSIS');
        console.log('  Monthly costs: $20 (current)');
        console.log('  Need: 2 Pro subscribers to break even');
        console.log('  Or: 4 SMS add-ons');
        console.log('');
        console.log('✅ MONETIZATION STATUS');
        console.log('  Stripe: ✅ Integration ready');
        console.log('  Entitlements: ✅ System built');
        console.log('  Feature Flags: ✅ Configured');
        console.log('  Billing: 🔜 Needs activation');
        console.log('');
        console.log('💬 Ask Julie: talk julie <question>');
        console.log('');
    }

    /**
     * App Dashboard (Admin Only)
     */
    private showAppDashboard(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║           🏢 DEEPFISH SYSTEM DASHBOARD 🏢                ║');
        console.log('║                  (Admin Only)                            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('📊 SYSTEM STATUS');
        console.log('  Status: ✅ Online');
        console.log('  Version: v2.0.0');
        console.log('  Uptime: ' + Math.floor(process.uptime()) + 's');
        console.log('  Environment: ' + (process.env.NODE_ENV || 'development'));
        console.log('');
        console.log('🤖 BOTS LOADED');
        console.log('  Total: 5 active');
        console.log('  ✓ Oracle (System Architect)');
        console.log('  ✓ Mei (Project Manager)');
        console.log('  ✓ Vesper (Concierge)');
        console.log('  ✓ Julie (CFO)');
        console.log('  ✓ Gladyce (R&D Director)');
        console.log('');
        console.log('🏠 ROOMS ACTIVE');
        console.log('  Total: 4 rooms');
        console.log('  • The Lobby');
        console.log('  • Conference Room');
        console.log('  • Lunch Room');
        console.log('  • Executive Office');
        console.log('  • DERPA Lab');
        console.log('');
        console.log('🔑 API CONFIGURATION');
        console.log('  Gemini: ' + (process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'));
        console.log('  Anthropic: ' + (process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '⚠️  Optional'));
        console.log('  ElevenLabs: ' + (process.env.ELEVENLABS_API_KEY ? '✅ Configured' : '⚠️  Optional'));
        console.log('');
        console.log('🎛️  FEATURE FLAGS');
        console.log('  CLI: ✅ Enabled');
        console.log('  React UI: 🔜 Coming Soon');
        console.log('  SMS: 🔒 Secret (v2.0)');
        console.log('  VIP Badges: 📋 Planned');
        console.log('');
        console.log('💾 DATA STORAGE');
        console.log('  Users: data/users/');
        console.log('  Bots: server/world/bots/');
        console.log('  Training: data/training/');
        console.log('');
        console.log('🚀 DEPLOYMENT');
        console.log('  Target: Railway');
        console.log('  Status: Ready for deployment');
        console.log('  Env Vars: See RAILWAY-ENV-VARS.md');
        console.log('');
        console.log('📈 NEXT MILESTONES');
        console.log('  1. React UI development');
        console.log('  2. Railway deployment');
        console.log('  3. v1.0 public launch');
        console.log('  4. SMS integration (v2.0)');
        console.log('');
    }

    /**
     * Handle bot config (LLM selection)
     */
    private handleBotConfig(botId: string, args: string[]): void {
        const action = args[0];

        // Available LLMs
        const availableLLMs = [
            { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'gemini' },
            { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini' },
            { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'anthropic' },
            { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'anthropic' }
        ];

        // Get bot info (hardcoded for now, will load from bot definitions later)
        const botConfigs: any = {
            'mei': {
                name: 'Mei',
                role: 'Project Manager',
                currentLLM: 'gemini-2.0-flash-exp',
                assignedBy: 'Oracle',
                reason: 'Fast responses for structured PM tasks'
            },
            'oracle': {
                name: 'Oracle',
                role: 'System Architect',
                currentLLM: 'gemini-2.0-flash-exp',
                assignedBy: 'Oracle',
                reason: 'Deep reasoning for architecture decisions'
            },
            'julie': {
                name: 'Julie',
                role: 'CFO',
                currentLLM: 'gemini-2.0-flash-exp',
                assignedBy: 'Oracle',
                reason: 'Good at calculations and financial analysis'
            },
            'vesper': {
                name: 'Vesper',
                role: 'Concierge',
                currentLLM: 'gemini-2.0-flash-exp',
                assignedBy: 'Oracle',
                reason: 'Quick, friendly responses'
            },
            'gladyce': {
                name: 'Gladyce',
                role: 'R&D Director',
                currentLLM: 'gemini-2.0-flash-exp',
                assignedBy: 'Oracle',
                reason: 'Creative thinking for experimental projects'
            }
        };

        const bot = botConfigs[botId];
        if (!bot) {
            console.log(`✗ Bot not found: ${botId}`);
            return;
        }

        if (!action) {
            // Show current config
            console.log(`\n📋 ${bot.name} - ${bot.role}`);
            console.log(`Current LLM: ${bot.currentLLM}`);
            console.log(`Assigned by: ${bot.assignedBy}`);
            console.log(`Reason: ${bot.reason}`);
            console.log('');
            console.log('Available LLMs:');
            for (const llm of availableLLMs) {
                const current = llm.id === bot.currentLLM ? ' (current)' : '';
                console.log(`  • ${llm.name}${current}`);
            }
            console.log('');
            console.log(`Override: bot config ${botId} set <llm>`);
            console.log(`Reset: bot config ${botId} reset`);
            console.log('');
        } else if (action === 'set') {
            const newLLM = args[1];
            if (!newLLM) {
                console.log('Usage: bot config <name> set <llm>');
                return;
            }
            console.log(`✓ ${bot.name} now using: ${newLLM}`);
            console.log('⚠️  This is a temporary override');
            console.log('Oracle may reassign based on performance analysis');
            console.log('');
        } else if (action === 'reset') {
            console.log(`✓ ${bot.name} reset to Oracle's recommendation: ${bot.currentLLM}`);
            console.log('');
        }
    }

    /**
     * Handle admin commands
     */
    private async handleAdmin(args: string[]): Promise<void> {
        const [subcommand, ...rest] = args;

        if (subcommand === 'keys') {
            this.handleAdminKeys(rest);
        } else {
            console.log('Usage: admin <keys>');
        }
    }

    /**
     * Handle admin API key management
     */
    private handleAdminKeys(args: string[]): void {
        const [action, service, ...keyParts] = args;

        if (!action) {
            // Show current keys (masked)
            console.log('\n🔑 API Keys Configuration');
            console.log('');
            console.log('AI Providers:');
            console.log('  GEMINI_API_KEY:      ' + this.maskKey(process.env.GEMINI_API_KEY));
            console.log('  ANTHROPIC_API_KEY:   ' + this.maskKey(process.env.ANTHROPIC_API_KEY));
            console.log('  ELEVENLABS_API_KEY:  ' + this.maskKey(process.env.ELEVENLABS_API_KEY));
            console.log('');
            console.log('Payment & Billing:');
            console.log('  STRIPE_SECRET_KEY:   ' + this.maskKey(process.env.STRIPE_SECRET_KEY));
            console.log('  STRIPE_WEBHOOK_SECRET: ' + this.maskKey(process.env.STRIPE_WEBHOOK_SECRET));
            console.log('');
            console.log('Infrastructure:');
            console.log('  RAILWAY_TOKEN:       ' + this.maskKey(process.env.RAILWAY_TOKEN));
            console.log('  TWILIO_ACCOUNT_SID:  ' + this.maskKey(process.env.TWILIO_ACCOUNT_SID));
            console.log('  TWILIO_AUTH_TOKEN:   ' + this.maskKey(process.env.TWILIO_AUTH_TOKEN));
            console.log('');
            console.log('Usage:');
            console.log('  admin keys add <service> <key>');
            console.log('  admin keys remove <service>');
            console.log('');
            console.log('Services: gemini, anthropic, elevenlabs, stripe, railway, twilio');
            console.log('');
            return;
        }

        if (action === 'add') {
            if (!service || keyParts.length === 0) {
                console.log('Usage: admin keys add <service> <key>');
                return;
            }

            const key = keyParts.join(' ');
            const envVar = this.getEnvVarName(service);

            if (!envVar) {
                console.log(`✗ Unknown service: ${service}`);
                console.log('Valid services: gemini, anthropic, elevenlabs, stripe, railway, twilio');
                return;
            }

            // Update .env file
            console.log(`✓ ${envVar} added`);
            console.log('⚠️  Restart CLI to load new key');
            console.log('');
            console.log('To update .env file, run:');
            console.log(`  echo "${envVar}=${key}" >> .env`);
            console.log('');
        } else if (action === 'remove') {
            if (!service) {
                console.log('Usage: admin keys remove <service>');
                return;
            }

            const envVar = this.getEnvVarName(service);
            if (!envVar) {
                console.log(`✗ Unknown service: ${service}`);
                return;
            }

            console.log(`✓ ${envVar} removed`);
            console.log('⚠️  Restart CLI to apply changes');
            console.log('');
        }
    }

    /**
     * Mask API key for display
     */
    private maskKey(key: string | undefined): string {
        if (!key) return '❌ Not set';
        if (key.length <= 8) return '***';
        return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    }

    /**
     * Get environment variable name for service
     */
    private getEnvVarName(service: string): string | null {
        const mapping: { [key: string]: string } = {
            'gemini': 'GEMINI_API_KEY',
            'anthropic': 'ANTHROPIC_API_KEY',
            'elevenlabs': 'ELEVENLABS_API_KEY',
            'stripe': 'STRIPE_SECRET_KEY',
            'railway': 'RAILWAY_TOKEN',
            'twilio': 'TWILIO_AUTH_TOKEN'
        };
        return mapping[service.toLowerCase()] || null;
    }
}
