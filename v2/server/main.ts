/**
 * Main Entry Point - Starts Leon (VP of Operations)
 * Leon manages all other components
 */

import 'dotenv/config';
import { leon } from './leon.js';
import { logger } from './utils/logger.js';

async function main() {
    logger.info('═══════════════════════════════════════');
    logger.info('🏢 DeepFish AI Studio v2');
    logger.info('   Starting Building Operations...');
    logger.info('═══════════════════════════════════════');

    try {
        // Start Leon - he manages everything else
        await leon.start();
    } catch (error) {
        logger.error('Failed to start Leon:', error);
        process.exit(1);
    }
}

main();
