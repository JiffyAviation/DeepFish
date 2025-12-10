/**
 * Test Notification System
 */

import { notificationCenter } from './server/utils/notificationCenter.js';
import { logger } from './server/utils/logger.js';

logger.info('🔔 Testing Notification Center');
logger.info('================================\n');

// Subscribe to notifications
notificationCenter.subscribe((notification) => {
    logger.info(`📬 Received: ${notification.title}`);
});

// Test 1: Maintenance schedule
logger.info('Test 1: Scheduling maintenance...');
const maintenanceTime = new Date();
maintenanceTime.setHours(14, 0, 0); // 14:00 today
notificationCenter.scheduleMaintenance('Conference Room', maintenanceTime, 15);

await sleep(1000);

// Test 2: Component update
logger.info('\nTest 2: Component update...');
notificationCenter.componentUpdate('Conference Room', '2.0.0', 'brief');

await sleep(1000);

// Test 3: Emergency alert
logger.info('\nTest 3: Emergency alert...');
notificationCenter.emergency('Router', 'High traffic detected - scaling up');

await sleep(1000);

// Test 4: General announcement
logger.info('\nTest 4: General announcement...');
notificationCenter.announce(
    'New Feature Available',
    'Multi-bot conference mode is now live in Conference Room!'
);

await sleep(1000);

// Show recent notifications
logger.info('\n📋 Recent Notifications:');
const recent = notificationCenter.getRecent(5);
for (const notif of recent) {
    logger.info(`  - [${notif.priority.toUpperCase()}] ${notif.title}`);
    logger.info(`    ${notif.message}`);
}

logger.info('\n✅ Notification Center Test Complete');

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
