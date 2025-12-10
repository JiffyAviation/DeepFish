/**
 * Leon - VP of Operations
 * The Building Manager who keeps everything running
 * 
 * Responsibilities:
 * - Monitor health of all components (Router, Bots, Rooms)
 * - Auto-restart crashed components
 * - Maintain system health dashboard
 * - Emergency broadcast system
 * - Graceful shutdown coordination
 */

import { spawn, ChildProcess } from 'child_process';
import { logger } from './utils/logger.js';
import { gracefulShutdown } from './utils/gracefulShutdown.js';
import { notificationCenter } from './utils/notificationCenter.js';

interface ComponentHealth {
    name: string;
    type: 'router' | 'bot' | 'room';
    status: 'online' | 'offline' | 'restarting';
    pid?: number;
    lastHeartbeat: number;
    restartCount: number;
}

export class Leon {
    private components = new Map<string, ComponentHealth>();
    private processes = new Map<string, ChildProcess>();
    private healthCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        logger.info('[Leon] VP of Operations initializing...');

        // Register shutdown handler
        gracefulShutdown.onShutdown(async () => {
            await this.shutdown();
        });
    }

    /**
     * Start Leon and all managed components
     */
    async start(): Promise<void> {
        logger.info('[Leon] ═══════════════════════════════════════');
        logger.info('[Leon] Leon - VP of Operations ONLINE');
        logger.info('[Leon] Building Manager Active');
        logger.info('[Leon] ═══════════════════════════════════════');

        // Start Router
        await this.startComponent('router', 'router', './server/router-minimal.ts');

        // Start health monitoring
        this.startHealthMonitoring();

        logger.info('[Leon] All systems operational');
    }

    /**
     * Start a component (Router, Bot, etc.)
     */
    private async startComponent(
        name: string,
        type: 'router' | 'bot' | 'room',
        scriptPath: string,
        args: string[] = []
    ): Promise<void> {
        logger.info(`[Leon] Starting ${name}...`);

        // Spawn process
        const childProcess = spawn('node', ['--import', 'tsx', scriptPath, ...args], {
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, COMPONENT_NAME: name }
        });

        // Track component
        this.components.set(name, {
            name,
            type,
            status: 'online',
            pid: childProcess.pid,
            lastHeartbeat: Date.now(),
            restartCount: 0
        });

        this.processes.set(name, childProcess);

        // Listen for output
        childProcess.stdout?.on('data', (data: Buffer) => {
            logger.info(`[${name}] ${data.toString().trim()}`);
            this.recordHeartbeat(name);
        });

        childProcess.stderr?.on('data', (data: Buffer) => {
            logger.error(`[${name}] ${data.toString().trim()}`);
        });

        // Handle exit
        childProcess.on('exit', (code: number | null) => {
            logger.warn(`[Leon] ${name} exited with code ${code}`);
            this.handleComponentCrash(name, type, scriptPath, args);
        });

        logger.info(`[Leon] ✓ ${name} started (PID: ${childProcess.pid})`);
    }

    /**
     * Handle component crash
     */
    private async handleComponentCrash(
        name: string,
        type: 'router' | 'bot' | 'room',
        scriptPath: string,
        args: string[]
    ): Promise<void> {
        const component = this.components.get(name);
        if (!component) return;

        component.status = 'offline';
        component.restartCount++;

        logger.error(`[Leon] 🔥 ${name} crashed! (Restart count: ${component.restartCount})`);

        // Check restart limit
        if (component.restartCount > 5) {
            logger.error(`[Leon] ❌ ${name} exceeded restart limit - manual intervention required`);
            this.broadcastEmergency(`${name} is down and requires manual restart`);
            return;
        }

        // Wait before restart (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, component.restartCount - 1), 30000);
        logger.info(`[Leon] Restarting ${name} in ${delay}ms...`);

        setTimeout(async () => {
            component.status = 'restarting';
            await this.startComponent(name, type, scriptPath, args);
            this.broadcastEmergency(`${name} has been restarted`);
        }, delay);
    }

    /**
     * Record heartbeat from component
     */
    private recordHeartbeat(name: string): void {
        const component = this.components.get(name);
        if (component) {
            component.lastHeartbeat = Date.now();
        }
    }

    /**
     * Start health monitoring
     */
    private startHealthMonitoring(): void {
        this.healthCheckInterval = setInterval(() => {
            const now = Date.now();

            for (const [name, component] of this.components.entries()) {
                // Check if component is unresponsive (no heartbeat in 30s)
                if (component.status === 'online' && now - component.lastHeartbeat > 30000) {
                    logger.warn(`[Leon] ⚠️  ${name} appears unresponsive`);

                    // Try to kill and restart
                    const childProcess = this.processes.get(name);
                    if (childProcess) {
                        childProcess.kill();
                    }
                }
            }
        }, 10000); // Check every 10 seconds
    }

    /**
     * Broadcast emergency message
     */
    private broadcastEmergency(message: string): void {
        logger.warn(`[Leon] 📢 EMERGENCY BROADCAST: ${message}`);
        notificationCenter.emergency('System', message);
    }

    /**
     * Get system health report
     */
    getHealthReport(): any {
        const report: any = {
            timestamp: new Date().toISOString(),
            components: []
        };

        for (const [name, component] of this.components.entries()) {
            report.components.push({
                name: component.name,
                type: component.type,
                status: component.status,
                pid: component.pid,
                restartCount: component.restartCount,
                lastHeartbeat: new Date(component.lastHeartbeat).toISOString()
            });
        }

        return report;
    }

    /**
     * Graceful shutdown
     */
    private async shutdown(): Promise<void> {
        logger.info('[Leon] Initiating graceful shutdown of all components...');

        // Stop health monitoring
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        // Stop all processes
        for (const [name, childProcess] of this.processes.entries()) {
            logger.info(`[Leon] Stopping ${name}...`);
            childProcess.kill('SIGTERM');
        }

        // Wait for processes to exit
        await new Promise(resolve => setTimeout(resolve, 2000));

        logger.info('[Leon] All components stopped. VP of Operations signing off.');
    }

    /**
     * Start a bot process
     */
    async startBot(botId: string, config: any): Promise<void> {
        await this.startComponent(
            `bot-${botId}`,
            'bot',
            './bots/bot-runner.ts',
            [botId]
        );
    }
}

// Create and export Leon instance
export const leon = new Leon();
