/**
 * CLI Entry Point
 * Start the MUD/MUSH interface
 */

import 'dotenv/config';
import { MudCLI } from './server/mudCLI.js';
import { logger } from './server/utils/logger.js';

logger.info('[CLI] Starting DeepFish MUD/MUSH interface...');

const cli = new MudCLI('admin');
cli.start();
