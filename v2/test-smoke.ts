/**
 * Simple Smoke Test
 * Just verify Leon can start
 */

import { logger } from './server/utils/logger.js';
import { leon } from './server/leon.js';

async function smokeTest() {
    logger.info('🔥 SMOKE TEST - Can Leon start?');

    try {
        await leon.start();
        logger.info('✅ Leon started successfully!');

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check health
        const report = leon.getHealthReport();
        logger.info('Health Report:', JSON.stringify(report, null, 2));

        logger.info('✅ SMOKE TEST PASSED');
        process.exit(0);
    } catch (error) {
        logger.error('❌ SMOKE TEST FAILED:', error);
        process.exit(1);
    }
}

smokeTest();
