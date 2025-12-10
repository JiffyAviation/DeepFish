/**
 * Main Server Entry Point
 * Sets up Express server with Message Router and Orchestrator
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MessageRouter } from './messageRouter.js';
import { Orchestrator } from './orchestrator.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize core systems
const router = new MessageRouter();
const orchestrator = new Orchestrator();

// Connect router to orchestrator
router.setOrchestrator(orchestrator);

// Start orchestrator
await orchestrator.start();

/**
 * POST /api/chat
 * Send message to a bot
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { text, userId = 'user', botId = 'mei' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text' });
        }

        // Send through router (queued and logged)
        const response = await router.receiveFromUI({
            text,
            userId,
            botId
        });

        res.json(response);
    } catch (error: any) {
        logger.error('[API] Error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    const stats = router.getStats();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        router: stats,
        apiKeyConfigured: !!process.env.GEMINI_API_KEY || !!process.env.ANTHROPIC_API_KEY
    });
});

/**
 * GET /stats
 * System statistics
 */
app.get('/stats', (req, res) => {
    const stats = router.getStats();

    res.json({
        router: stats,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`[Server] DeepFish v2 running on http://localhost:${PORT}`);
    logger.info(`[Server] API Key configured: ${!!process.env.GEMINI_API_KEY || !!process.env.ANTHROPIC_API_KEY}`);
});
