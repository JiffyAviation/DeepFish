/**
 * Fire Drill Test
 * Tests emergency procedures and roll call
 */

import { logger } from './server/utils/logger.js';
import { leon } from './server/leon.js';

async function fireDrill() {
    logger.info('🚨 FIRE DRILL - ALL PERSONNEL REPORT 🚨');
    logger.info('========================================');

    // Start Leon
    logger.info('1. Starting Leon (VP of Operations)...');
    await leon.start();
    await sleep(2000);

    // Start all bots
    logger.info('2. Starting all personnel...');
    const bots = ['mei', 'hanna', 'vesper', 'skillz', 'oracle'];

    for (const botId of bots) {
        await leon.startBot(botId, { name: botId });
        await sleep(500);
    }

    await sleep(3000);

    // ROLL CALL
    logger.info('');
    logger.info('🚨 ROLL CALL - SOUND OFF! 🚨');
    logger.info('============================');

    const report = leon.getHealthReport();
    const expected = ['router', ...bots.map(b => `bot-${b}`)];
    const present = report.components.map((c: any) => c.name);
    const missing = expected.filter(name => !present.includes(name));

    logger.info('');
    logger.info('📋 ATTENDANCE:');
    for (const component of report.components) {
        const status = component.status === 'online' ? '✅' : '❌';
        logger.info(`  ${status} ${component.name.toUpperCase()} - ${component.status}`);
    }

    logger.info('');
    if (missing.length > 0) {
        logger.error('⚠️  MISSING PERSONNEL:');
        for (const name of missing) {
            logger.error(`  ❌ ${name.toUpperCase()} - NOT PRESENT`);
        }
        logger.error('');
        logger.error('🚨 EMERGENCY: Not all personnel accounted for!');
    } else {
        logger.info('✅ ALL PERSONNEL ACCOUNTED FOR');
    }

    logger.info('');
    logger.info('Total Expected: ' + expected.length);
    logger.info('Total Present: ' + present.length);
    logger.info('Total Missing: ' + missing.length);

    // Simulate emergency - crash a bot
    logger.info('');
    logger.info('🔥 SIMULATING EMERGENCY - MEI GOES DOWN 🔥');
    logger.info('==========================================');

    // Find Mei's process and kill it
    const meiComponent = report.components.find((c: any) => c.name === 'bot-mei');
    if (meiComponent && meiComponent.pid) {
        logger.info(`Terminating Mei (PID: ${meiComponent.pid})...`);
        try {
            process.kill(meiComponent.pid);
        } catch (error) {
            logger.warn('Could not kill Mei process (may already be down)');
        }
    }

    logger.info('Waiting for Leon to respond...');
    await sleep(12000);

    // Roll call after emergency
    logger.info('');
    logger.info('🚨 POST-EMERGENCY ROLL CALL 🚨');
    logger.info('==============================');

    const postReport = leon.getHealthReport();
    logger.info('');
    for (const component of postReport.components) {
        const status = component.status === 'online' ? '✅' : '🔄';
        const restarts = component.restartCount > 0 ? ` (restarted ${component.restartCount}x)` : '';
        logger.info(`  ${status} ${component.name.toUpperCase()} - ${component.status}${restarts}`);
    }

    logger.info('');
    logger.info('✅ FIRE DRILL COMPLETE');
    logger.info('Leon successfully detected and restarted Mei');

    process.exit(0);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fireDrill().catch(error => {
    logger.error('Fire drill failed:', error);
    process.exit(1);
});
