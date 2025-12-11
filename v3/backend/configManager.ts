/**
 * Configuration Management Backend
 * Handles API key storage and .env updates
 */

import fs from 'fs/promises';
import path from 'path';

export class ConfigManager {
    private envPath: string;

    constructor(envPath: string = '.env') {
        this.envPath = envPath;
    }

    /**
     * Update .env file with new configuration
     */
    async updateConfig(config: Record<string, string>): Promise<boolean> {
        try {
            // Read current .env
            let envContent = '';
            try {
                envContent = await fs.readFile(this.envPath, 'utf-8');
            } catch {
                // File doesn't exist, create new
                envContent = '';
            }

            // Parse existing .env
            const envVars = this.parseEnv(envContent);

            // Map frontend keys to .env keys
            const keyMap: Record<string, string> = {
                'gemini': 'GEMINI_API_KEY',
                'anthropic': 'ANTHROPIC_API_KEY',
                'abacus': 'ABACUS_API_KEY',
                'elevenlabs': 'ELEVENLABS_API_KEY',
                'twilio-sid': 'TWILIO_ACCOUNT_SID',
                'twilio-token': 'TWILIO_AUTH_TOKEN',
                'twilio-phone': 'TWILIO_PHONE_NUMBER',
                'email-user': 'EMAIL_USER',
                'email-password': 'EMAIL_PASSWORD',
                'email-imap': 'EMAIL_IMAP_HOST',
                'email-smtp': 'EMAIL_SMTP_HOST',
                'database-url': 'DATABASE_URL'
            };

            // Update values
            Object.keys(config).forEach(key => {
                const envKey = keyMap[key];
                if (envKey && config[key]) {
                    envVars[envKey] = config[key];
                }
            });

            // Write back to .env
            const newEnvContent = Object.entries(envVars)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');

            await fs.writeFile(this.envPath, newEnvContent, 'utf-8');

            console.log('[Config] Updated .env file');
            return true;
        } catch (error) {
            console.error('[Config] Error updating .env:', error);
            return false;
        }
    }

    /**
     * Read current configuration
     */
    async readConfig(): Promise<Record<string, string>> {
        try {
            const envContent = await fs.readFile(this.envPath, 'utf-8');
            return this.parseEnv(envContent);
        } catch {
            return {};
        }
    }

    /**
     * Parse .env file content
     */
    private parseEnv(content: string): Record<string, string> {
        const vars: Record<string, string> = {};

        content.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key) {
                    vars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });

        return vars;
    }
}

/**
 * Express endpoint for config management
 */
export function createConfigEndpoint(configManager: ConfigManager) {
    return {
        // POST /api/config - Update configuration
        update: async (req: any, res: any) => {
            const config = req.body;
            const success = await configManager.updateConfig(config);

            if (success) {
                res.json({ success: true, message: 'Configuration updated' });
            } else {
                res.status(500).json({ success: false, message: 'Failed to update configuration' });
            }
        },

        // GET /api/config - Read configuration (masked)
        read: async (req: any, res: any) => {
            const config = await configManager.readConfig();

            // Mask sensitive values
            const masked = Object.entries(config).reduce((acc, [key, value]) => {
                if (value) {
                    // Show first 4 and last 4 characters
                    acc[key] = value.length > 8
                        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
                        : '****';
                }
                return acc;
            }, {} as Record<string, string>);

            res.json(masked);
        }
    };
}

export const configManager = new ConfigManager();
