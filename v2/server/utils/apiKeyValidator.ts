/**
 * API Key Validator
 * Checks for missing API keys and guides user to get them
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface LLMProvider {
    name: string;
    envVar: string;
    signupUrl: string;
    docsUrl: string;
    description: string;
}

const LLM_PROVIDERS: Record<string, LLMProvider> = {
    'gemini': {
        name: 'Google Gemini',
        envVar: 'GEMINI_API_KEY',
        signupUrl: 'https://makersuite.google.com/app/apikey',
        docsUrl: 'https://ai.google.dev/tutorials/setup',
        description: 'Google\'s latest AI model (Gemini 2.0 Flash)'
    },
    'claude': {
        name: 'Anthropic Claude',
        envVar: 'ANTHROPIC_API_KEY',
        signupUrl: 'https://console.anthropic.com/',
        docsUrl: 'https://docs.anthropic.com/claude/docs/getting-started',
        description: 'Anthropic\'s Claude 3.5 Sonnet'
    },
    'openai': {
        name: 'OpenAI',
        envVar: 'OPENAI_API_KEY',
        signupUrl: 'https://platform.openai.com/signup',
        docsUrl: 'https://platform.openai.com/docs/quickstart',
        description: 'OpenAI GPT-4 and GPT-3.5'
    },
    'deepseek': {
        name: 'DeepSeek',
        envVar: 'DEEPSEEK_API_KEY',
        signupUrl: 'https://platform.deepseek.com/',
        docsUrl: 'https://platform.deepseek.com/docs',
        description: 'DeepSeek R1 reasoning model'
    }
};

export class APIKeyValidator {

    /**
     * Check if API key exists for a provider
     */
    hasAPIKey(provider: string): boolean {
        const providerInfo = LLM_PROVIDERS[provider.toLowerCase()];
        if (!providerInfo) return false;

        return !!process.env[providerInfo.envVar];
    }

    /**
     * Get missing API keys from Oracle's recommendations
     */
    async getMissingKeys(): Promise<{
        provider: string;
        info: LLMProvider;
    }[]> {
        const oraclePath = join(process.cwd(), 'data', 'oracle', 'llm-preferences.json');

        if (!existsSync(oraclePath)) {
            return [];
        }

        const content = readFileSync(oraclePath, 'utf-8');
        const preferences = JSON.parse(content);

        const missing: { provider: string; info: LLMProvider }[] = [];

        // Check each bot's assigned LLMs
        for (const [botId, assignment] of Object.entries(preferences.assignments || {})) {
            const botAssignment = assignment as any;

            for (const tier of ['best', 'better', 'good']) {
                const model = botAssignment[tier];
                if (!model) continue;

                // Extract provider from model name
                let provider = '';
                if (model.includes('gemini')) provider = 'gemini';
                else if (model.includes('claude')) provider = 'claude';
                else if (model.includes('gpt')) provider = 'openai';
                else if (model.includes('deepseek')) provider = 'deepseek';

                if (provider && !this.hasAPIKey(provider)) {
                    const providerInfo = LLM_PROVIDERS[provider];
                    if (!missing.find(m => m.provider === provider)) {
                        missing.push({ provider, info: providerInfo });
                    }
                }
            }
        }

        return missing;
    }

    /**
     * Show missing API key warning
     */
    showMissingKeyWarning(provider: string, info: LLMProvider): void {
        console.log(chalk.red.bold('\n⚠️  MISSING API KEY\n'));
        console.log(chalk.yellow(`Oracle recommends using ${info.name}, but no API key was found.\n`));

        console.log(chalk.cyan('To get your API key:\n'));
        console.log(`1. Visit: ${chalk.underline(info.signupUrl)}`);
        console.log(`2. Sign up or log in`);
        console.log(`3. Generate an API key`);
        console.log(`4. Add to your .env file:\n`);
        console.log(chalk.gray(`   ${info.envVar}=your-api-key-here\n`));

        console.log(chalk.cyan('Documentation:'));
        console.log(`${chalk.underline(info.docsUrl)}\n`);

        console.log(chalk.yellow('Until you add the key, DeepFish will use fallback models.\n'));
    }

    /**
     * Show all missing keys
     */
    async showAllMissingKeys(): Promise<void> {
        const missing = await this.getMissingKeys();

        if (missing.length === 0) {
            console.log(chalk.green('✓ All recommended API keys are configured!\n'));
            return;
        }

        console.log(chalk.red.bold('\n⚠️  MISSING API KEYS\n'));
        console.log(chalk.yellow(`Oracle recommends ${missing.length} LLM provider(s), but API keys are missing:\n`));

        for (const { provider, info } of missing) {
            console.log(chalk.cyan.bold(`${info.name}:`));
            console.log(`  Signup: ${chalk.underline(info.signupUrl)}`);
            console.log(`  Docs: ${chalk.underline(info.docsUrl)}`);
            console.log(`  Add to .env: ${chalk.gray(info.envVar)}=your-key\n`);
        }

        console.log(chalk.yellow('DeepFish will use fallback models until keys are added.\n'));
    }

    /**
     * Check on startup and warn user
     */
    async checkOnStartup(): Promise<boolean> {
        const missing = await this.getMissingKeys();

        if (missing.length === 0) {
            return true; // All good
        }

        // Show warning
        await this.showAllMissingKeys();

        return false; // Has missing keys
    }

    /**
     * Get API key status for all providers
     */
    getAPIKeyStatus(): Record<string, {
        configured: boolean;
        provider: LLMProvider;
    }> {
        const status: Record<string, any> = {};

        for (const [provider, info] of Object.entries(LLM_PROVIDERS)) {
            status[provider] = {
                configured: this.hasAPIKey(provider),
                provider: info
            };
        }

        return status;
    }

    /**
   * Interactive setup wizard
   */
    async runSetupWizard(): Promise<void> {
        console.log(chalk.bold('\n🔑 API Key Setup Wizard\n'));

        const missing = await this.getMissingKeys();

        if (missing.length === 0) {
            console.log(chalk.green('✓ All API keys are configured!\n'));
            return;
        }

        console.log(chalk.yellow(`You need to set up ${missing.length} API key(s):\n`));

        for (let i = 0; i < missing.length; i++) {
            const { provider, info } = missing[i];

            console.log(chalk.cyan.bold(`\n[${i + 1}/${missing.length}] ${info.name}\n`));
            console.log(`${info.description}\n`);

            console.log(chalk.bold('Steps:'));
            console.log(`1. Open: ${chalk.underline(info.signupUrl)}`);
            console.log(`2. Sign up and generate API key`);
            console.log(`3. Add to .env file:\n`);
            console.log(chalk.gray(`   ${info.envVar}=your-api-key-here\n`));

            console.log(chalk.gray('Press Enter to continue...'));
        }

        console.log(chalk.yellow('\nAfter adding keys, restart DeepFish.\n'));
    }

    /**
     * Interactive prompt for missing API key
     * Returns: 'signup' | 'optout' | 'skip'
     */
    async promptForMissingKey(provider: string, info: LLMProvider): Promise<'signup' | 'optout' | 'skip'> {
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            console.log(chalk.red.bold('\n⚠️  MISSING API KEY\n'));
            console.log(chalk.yellow(`Oracle recommends ${info.name}, but no API key was found.\n`));
            console.log(`${info.description}\n`);

            console.log(chalk.cyan('What would you like to do?\n'));
            console.log('1. Get API key (opens signup page)');
            console.log('2. Opt out (don\'t ask again for this provider)');
            console.log('3. Skip for now\n');

            rl.question('Choose (1/2/3): ', async (answer) => {
                rl.close();

                if (answer === '1') {
                    // Open signup URL
                    console.log(chalk.cyan(`\nOpening: ${info.signupUrl}\n`));
                    console.log(chalk.gray('After getting your key, add to .env:'));
                    console.log(chalk.gray(`${info.envVar}=your-api-key-here\n`));

                    // Open URL in browser (platform-specific)
                    const { exec } = await import('child_process');
                    const command = process.platform === 'win32'
                        ? `start ${info.signupUrl}`
                        : process.platform === 'darwin'
                            ? `open ${info.signupUrl}`
                            : `xdg-open ${info.signupUrl}`;

                    exec(command);
                    resolve('signup');
                } else if (answer === '2') {
                    // Opt out
                    const { apiKeyOptOut } = await import('./apiKeyOptOut.js');
                    await apiKeyOptOut.optOut(provider, 'User opted out - too expensive or not needed');
                    console.log(chalk.yellow(`\n✓ Opted out of ${info.name}`));
                    console.log(chalk.gray('DeepFish will use alternative models\n'));
                    resolve('optout');
                } else {
                    // Skip
                    console.log(chalk.gray('\nSkipped for now. You can add the key later.\n'));
                    resolve('skip');
                }
            });
        });
    }
}

// Singleton
export const apiKeyValidator = new APIKeyValidator();

/**
 * Example usage:
 * 
 * // On app startup
 * await apiKeyValidator.checkOnStartup();
 * 
 * // Interactive prompt
 * const choice = await apiKeyValidator.promptForMissingKey('gemini', LLM_PROVIDERS['gemini']);
 * 
 * // Show setup wizard
 * await apiKeyValidator.runSetupWizard();
 * 
 * // Check specific provider
 * if (!apiKeyValidator.hasAPIKey('gemini')) {
 *   console.log('Gemini API key missing!');
 * }
 */
