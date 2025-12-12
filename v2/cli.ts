/**
 * CLI Entry Point
 * Simple natural language interface
 */

import 'dotenv/config';
import { SimpleCLI } from './server/simpleCLI.js';
import { botLoader } from './server/world/botLoader.js';
import { logger } from './server/utils/logger.js';

logger.info('[CLI] Starting DeepFish natural language interface...');

// Load bots first
await botLoader.loadAll();

const cli = new SimpleCLI('admin');
cli.start();
