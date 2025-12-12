/**
 * Simple CLI - Pure Natural Language Interface
 * No commands, just conversation
 */

import readline from 'readline';
import { messageRouter } from './messageRouter.js';
import { botLoader } from './world/botLoader.js';
import { logger } from './utils/logger.js';
import { credentialManager } from './utils/credentialManager.js';

export class SimpleCLI {
    private rl: readline.Interface;
    private userId: string;

    constructor(userId: string = 'admin') {
        this.userId = userId;

        // Create readline interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        });
    }

    /**
     * Start CLI
     */
    start(): void {
        this.showWelcome();

        this.rl.on('line', async (input) => {
            await this.handleInput(input.trim());
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
        console.log('║   Just type naturally to chat        ║');
        console.log('║   Type "quit" to exit                 ║');
        console.log('╚═══════════════════════════════════════╝\n');

        // Show available bots
        const bots = botLoader.listBots();
        console.log('Available bots:');
        for (const bot of bots) {
            console.log(`  • ${bot.name} - ${bot.title}`);
        }
        console.log('');
    }

    /**
     * Handle user input
     */
    private async handleInput(input: string): Promise<void> {
        if (!input) return;

        // Handle quit
        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
            this.rl.close();
            return;
        }

        try {
            // Route message using LLM
            console.log(''); // Blank line before response
            const routing = await messageRouter.route(input);

            // Check for API key (env var first, then credential manager)
            const apiKey = process.env.GEMINI_API_KEY || await credentialManager.getApiKey(this.userId, 'gemini');
            if (!apiKey) {
                console.log('⚠️  No Gemini API key found.');
                console.log('   Set GEMINI_API_KEY in your .env file\n');
                return;
            }

            // Get responses from all routed bots
            for (const botId of routing.bots) {
                const bot = botLoader.getBot(botId);
                if (!bot) {
                    console.log(`❌ Bot not found: ${botId}\n`);
                    continue;
                }

                console.log(`💬 ${bot.name} is thinking...`);

                try {
                    // Access the bot's AI runner directly
                    const response = await bot['aiRunner'].generateResponse(input, []);
                    console.log(`\n${bot.name}: ${response}\n`);
                } catch (error: any) {
                    console.log(`❌ ${bot.name} error: ${error.message}\n`);
                    logger.error(`[SimpleCLI] Bot ${botId} error:`, error);
                }
            }

        } catch (error: any) {
            console.log(`❌ Error: ${error.message}\n`);
            logger.error('[SimpleCLI] Error:', error);
        }
    }
}
