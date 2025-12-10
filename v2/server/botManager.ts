/**
 * Bot Manager
 * Manages lifecycle of bot processes (start/stop/restart)
 */

import { fork, ChildProcess } from 'child_process';
import { logger } from './utils/logger.js';
import type { UserMessage, BotResponse, BotConfig } from '../types/index.js';

interface BotProcess {
    process: ChildProcess;
    status: 'starting' | 'running' | 'crashed' | 'stopped';
    startTime: number;
    config: BotConfig;
}

export class BotManager {
    private bots = new Map<string, BotProcess>();

    /**
     * Start a bot process
     */
    async startBot(config: BotConfig): Promise<void> {
        logger.info(`[BotManager] Starting bot: ${config.id}`);

        // Fork a new Node.js process for this bot
        const childProcess = fork('./bots/bot-runner.js', [config.id], {
            env: {
                ...process.env,
                BOT_ID: config.id,
                BOT_CONFIG: JSON.stringify(config)
            }
        });

        const botProcess: BotProcess = {
            process: childProcess,
            status: 'starting',
            startTime: Date.now(),
            config
        };

        // Set up IPC handlers
        childProcess.on('message', (msg: any) => {
            if (msg.type === 'ready') {
                botProcess.status = 'running';
                logger.info(`[BotManager] Bot ${config.id} is ready`);
            }
        });

        childProcess.on('error', (err) => {
            logger.error(`[BotManager] Bot ${config.id} error:`, err);
            botProcess.status = 'crashed';
        });

        childProcess.on('exit', (code) => {
            logger.warn(`[BotManager] Bot ${config.id} exited with code ${code}`);
            botProcess.status = 'crashed';
        });

        this.bots.set(config.id, botProcess);

        // Wait for bot to be ready
        await this.waitForReady(config.id, 5000);
    }

    /**
     * Send message to bot
     */
    async sendToBot(botId: string, message: UserMessage): Promise<BotResponse> {
        const bot = this.bots.get(botId);

        if (!bot || bot.status !== 'running') {
            throw new Error(`Bot ${botId} not available (status: ${bot?.status || 'not found'})`);
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Bot ${botId} timeout`));
            }, 30000);

            // Send message via IPC
            bot.process.send({ type: 'generate', message });

            // Wait for response
            const handler = (response: any) => {
                if (response.type === 'response') {
                    clearTimeout(timeout);
                    bot.process.off('message', handler);
                    resolve(response.data);
                }
            };

            bot.process.on('message', handler);
        });
    }

    /**
     * Restart a bot
     */
    async restartBot(botId: string): Promise<void> {
        const bot = this.bots.get(botId);
        if (!bot) return;

        logger.info(`[BotManager] Restarting bot: ${botId}`);

        // Kill old process
        bot.process.kill();
        this.bots.delete(botId);

        // Start new process
        await this.startBot(bot.config);
    }

    /**
     * Check health of all bots
     */
    checkAllBots(): Array<{ botId: string; status: string }> {
        const health: Array<{ botId: string; status: string }> = [];

        for (const [botId, bot] of this.bots.entries()) {
            health.push({ botId, status: bot.status });
        }

        return health;
    }

    /**
     * Wait for bot to be ready
     */
    private waitForReady(botId: string, timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                const bot = this.bots.get(botId);
                if (bot?.status === 'running') {
                    clearInterval(interval);
                    resolve();
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    reject(new Error(`Bot ${botId} failed to start`));
                }
            }, 100);
        });
    }
}
