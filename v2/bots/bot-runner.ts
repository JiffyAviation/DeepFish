/**
 * Simple Bot Runner for Testing
 * This will be a real bot process that Leon can manage
 */

import { logger } from '../server/utils/logger.js';

const botId = process.argv[2] || 'test-bot';

logger.info(`[Bot ${botId}] Starting...`);

// Simulate bot initialization
setTimeout(() => {
    logger.info(`[Bot ${botId}] Ready`);
    process.send?.({ type: 'ready' });
}, 1000);

// Send heartbeat every 5 seconds
setInterval(() => {
    logger.info(`[Bot ${botId}] Heartbeat`);
}, 5000);

// Listen for messages from Leon
process.on('message', (msg: any) => {
    logger.info(`[Bot ${botId}] Received:`, msg);

    if (msg.type === 'crash') {
        logger.error(`[Bot ${botId}] Simulating crash!`);
        process.exit(1);
    }

    if (msg.type === 'generate') {
        // Simulate AI response
        setTimeout(() => {
            process.send?.({
                type: 'response',
                data: {
                    text: `Response from ${botId}`,
                    botId,
                    timestamp: new Date()
                }
            });
        }, 1000);
    }
});

logger.info(`[Bot ${botId}] Listening for messages...`);
